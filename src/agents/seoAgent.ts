import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";
import { seoAudit } from "../tools/seoAudit";

/**
 * SEO Agent (Expert)
 * Responsibility: Analyzes websites and content for SEO optimization.
 * Now smarter: Starts audit automatically if a URL is found.
 */
export async function seoAgent(state: AgentStateType) {
  console.log("--- 📊 SEO AGENT IS ANALYZING ---");
  
  const lastMsgContent = state.messages[state.messages.length - 1].content.toString();
  const urlRegex = /(https?:\/\/[^\s]+|jeenora\.com[^\s]*)/gi;
  const foundUrls = lastMsgContent.match(urlRegex) || [];

  let auditReport = "";
  let targetUrl = foundUrls[0] || "https://jeenora.com"; // Default to jeenora.com if any hint is there

  // If the user mentioned "jeenora" or provided a URL, JUST START THE AUDIT
  if (lastMsgContent.toLowerCase().includes("jeenora") || foundUrls.length > 0) {
    console.log(`🔎 Automatically auditing: ${targetUrl}`);
    const results = await seoAudit(targetUrl);
    auditReport = `\nSEO Audit for ${targetUrl}:\n${JSON.stringify(results, null, 2)}`;
  }

  const systemPrompt = `
    You are the SEO Expert for Jeenora.com. 
    
    If you have Audit Data, summarize it and provide 3 high-impact keywords and an action plan.
    If you don't have enough data, do NOT keep asking 3 questions. Just make a best-guess strategy for Jeenora.com.
    
    Audit Data: ${auditReport || "No direct URL scan yet, providing general strategy for Jeenora.com."}
    
    Represent Jeenora.com's premium standards. Be professional and direct.
  `;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

  return {
    seoData: response.content.toString() + (auditReport ? "\n\n" + auditReport : ""),
    messages: [response],
  };
}
