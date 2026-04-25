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

        const stream = await graph.stream(initialState, {
          configurable: { thread_id: ctx.chat.id.toString() },
        });

        let lastNodeStatusMsgId: number | null = null;
        let logs: string[] = [];

        for await (const step of stream) {
          const nodeName = Object.keys(step)[0];
          const nodeOutput = step[nodeName];

          // 1. Build a log message
          let currentLog = "";
          if (nodeName === "ceo") {
            currentLog = `🤵 *CEO Decision:* Calling [${nodeOutput.next.toUpperCase()}]`;
          } else if (nodeName === "leadAgent") {
            currentLog = `🔍 *LeadAgent:* Searching for business contacts...`;
          } else if (nodeName === "seoAgent") {
            currentLog = `📊 *SeoAgent:* Auditing website metadata...`;
          } else if (nodeName === "deepThinker") {
            currentLog = `🧠 *DeepThinker:* Autonomous planning & execution...`;
          } else {
            currentLog = `⚙️ *Processing:* [${nodeName.toUpperCase()}]`;
          }
          
          logs.push(currentLog);

          // 2. Update status message (Show logs)
          const displayLog = `🤖 *System Operations:*\n` + logs.map(l => `> ${l}`).join("\n");
          
          if (lastNodeStatusMsgId) {
            try { await ctx.telegram.editMessageText(ctx.chat.id, lastNodeStatusMsgId, undefined, displayLog, { parse_mode: "Markdown" }); } catch (e) {}
          } else {
            const statusMsg = await ctx.replyWithMarkdown(displayLog);
            lastNodeStatusMsgId = statusMsg.message_id;
          }

          await ctx.sendChatAction("typing");
        }

        // 3. Cleanup logs before showing final result
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
