import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";

/**
 * CEO Agent (The Supervisor)
 * Optimized for Short & Sweet Tanglish responses.
 */
export async function ceo(state: AgentStateType) {
  console.log(`--- 🤵 CEO IS ANALYZING INTENT (Leads: ${state.leads.length}, Research: ${!!state.researchData}, Code: ${!!state.finalCode}) ---`);
  
  const systemPrompt = `
    You are the CEO of Jeenora.com. You manage a team of experts:
    - leadAgent: Finds business leads.
    - researcher: Creates strategies.
    - seoAgent: Analyzes SEO and keywords.
    - seniorDeveloper: Writes code.
    - deepThinker: Autonomous expert for deep analysis and web actions (Like Google indexing, fixing complex site issues).

    CRITICAL RULES:
    1. Speak ONLY in TANGLISH (Tamil + English mix).
    2. Be EXTREMELY BRIEF (1 line only).
    3. If user says Hi/Hello/General chat: Respond shortly and end with "Next: FINISH".
    4. If user asks for a task or mentions a topic (leads, seo, code, etc.):
       - Just delegate to the right agent immediately. 
       - No leads? "Next: leadAgent"
       - SEO mentioned? "Next: seoAgent"
       - Code/Technical? "Next: seniorDeveloper"
       - Complex web action? "Next: deepThinker"
       - Done? "Next: FINISH"
    
    Don't summarize or explain. Just delegate or greet.
    Format: [Short Response] Next: [AgentName]
  `;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

  const content = response.content.toString();
  const nextMatch = content.match(/Next:\s*(\w+)/);
  const nextAgent = nextMatch ? nextMatch[1] : "FINISH";
  const userMessage = content.replace(/Next:\s*\w+/, "").trim();

  return {
    next: nextAgent,
    messages: [new HumanMessage({ content: userMessage, name: "ceo" })],
  };
}
