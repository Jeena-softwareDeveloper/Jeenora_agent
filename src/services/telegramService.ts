import { Telegraf } from "telegraf";
import { graph } from "../core/workflow";
import { HumanMessage } from "@langchain/core/messages";
import { config } from "../config/env";

export class TelegramService {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(config.telegram.token);
  }

  public start() {
    console.log("🤖 Jeenora Lead Bot Service is starting...");

    this.bot.start((ctx) => {
      ctx.reply("Welcome to Jeenora Lead Assistant! Send me a message like 'Find leads for Real Estate in Chennai' to begin.");
    });

    this.bot.on("text", async (ctx) => {
      const userMessage = ctx.message.text;
      await ctx.reply("🔍 Analyzing your request and searching for leads...");

      try {
        // 1. Show Typing Indicator
        await ctx.sendChatAction("typing");

        const initialState = {
          messages: [new HumanMessage(userMessage)],
        };

        // 2. Stream the graph to track agent transitions
        const stream = await graph.stream(initialState, {
          configurable: { thread_id: ctx.chat.id.toString() },
        });

        let lastNodeStatusMsgId: number | null = null;

        for await (const step of stream) {
          const nodeName = Object.keys(step)[0];

          // Delete previous status message if exists
          if (lastNodeStatusMsgId) {
            try { await ctx.deleteMessage(lastNodeStatusMsgId); } catch (e) {}
          }

          // Show which agent is currently working (Show and then it will be hidden in next step)
          const statusMsg = await ctx.reply(`⚙️ Working: [${nodeName.toUpperCase()}] ...`);
          lastNodeStatusMsgId = statusMsg.message_id;

          // Also keep the typing indicator active for long tasks
          await ctx.sendChatAction("typing");
        }

        // Final cleanup of status message
        if (lastNodeStatusMsgId) {
          try { await ctx.deleteMessage(lastNodeStatusMsgId); } catch (e) {}
        }

        // 3. Get the final state to display results
        // (Note: We use the cumulative state from the stream's last result if needed, 
        // but for simplicity, we can fetch the latest state from the checkpointer)
        const finalState = await graph.getState({ configurable: { thread_id: ctx.chat.id.toString() } });
        const stateValues: any = finalState.values;

        // 4. Send CEO's response/greeting
        const lastMessage = stateValues.messages[stateValues.messages.length - 1];
        if (lastMessage && lastMessage.name === "ceo") {
          await ctx.reply(lastMessage.content.toString());
        }

        // 5. Send Leads
        if (stateValues.leads && stateValues.leads.length > 0) {
          let leadMsg = "📊 *LEADS FOUND:*\n\n";
          stateValues.leads.forEach((lead: string) => {
            leadMsg += `✅ ${lead}\n`;
          });
          await ctx.replyWithMarkdown(leadMsg);
        }

        // 6. Send SEO Strategy
        if (stateValues.seoData) {
          await ctx.reply("📈 *SEO Strategy & Analysis:*");
          const chunk = stateValues.seoData.substring(0, 4000);
          await ctx.reply(chunk);
        }

        // 7. Send Technical Analysis & Strategy
        if (stateValues.finalCode) {
          await ctx.reply("📝 *Technical Analysis & Strategy:*");
          const chunk = stateValues.finalCode.substring(0, 4000);
          await ctx.reply(chunk);
        }

      } catch (error) {
        console.error("Workflow Error:", error);
        await ctx.reply("❌ Sorry, something went wrong while processing your request.");
      }
    });

    this.bot.launch();

    // Enable graceful stop
    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }
}
