import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";
import { seoAudit } from "../tools/seoAudit";

/**
 * SEO Agent (Expert)
 * Responsibility: Analyzes websites and content for SEO optimization.
 */
export async function seoAgent(state: AgentStateType) {
  console.log("--- 📊 SEO AGENT IS AUDITING ---");
  
  const leads = state.leads;
  let auditReport = "";

  // If there's a lead with a URL, let's audit it!
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lastMsgContent = state.messages[state.messages.length - 1].content.toString();
  const foundUrls = lastMsgContent.match(urlRegex) || [];

  // Also check leads for URLs
  leads.forEach(lead => {
    const urls = lead.match(urlRegex);
    if (urls) foundUrls.push(...urls);
  });

  if (foundUrls.length > 0) {
    const targetUrl = foundUrls[0];
    console.log(`🔎 Found URL to audit: ${targetUrl}`);
    const results = await seoAudit(targetUrl);
    auditReport = `\nSEO Audit for ${targetUrl}:\n${JSON.stringify(results, null, 2)}`;
  }

  const systemPrompt = `
    You are the SEO Expert for Jeenora.com. 
    Review the following data and provide a professional SEO strategy.
    
    Technical Data: ${auditReport || "No direct URL provided for audit."}
    
    Tasks:
    1. Summarize the technical findings.
    2. Suggest 3 high-impact keywords.
    3. Provide actionable advice to improve ranking.
    
    Always represent Jeenora.com's premium standards.
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
