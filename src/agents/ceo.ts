import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";

/**
 * CEO Agent (The Supervisor)
 * Now with smarter intent analysis!
 */
export async function ceo(state: AgentStateType) {
  console.log(`--- 🤵 CEO IS ANALYZING INTENT (Leads: ${state.leads.length}, Research: ${!!state.researchData}, Code: ${!!state.finalCode}) ---`);
  
  const systemPrompt = `
    You are the CEO of Jeenora.com. You manage a team of experts:
    - leadAgent: Finds business leads.
    - researcher: Creates strategies.
    - seoAgent: Analyzes SEO and keywords.
    - seniorDeveloper: Writes code.

    CRITICAL RULE: Always speak in TANGLISH (a mix of Tamil and English). 
    Do NOT use pure or formal Tamil. Use a professional yet friendly "Senior Manager" style.
    Example: "Hi! Epdi irukeenga? Team ready-ah iruku, ena work palamnu solunga."

    Your Goal: Analyze the user's message and decide the next step.

    SCENARIO 1: Just a greeting (Hi, Hello) or general chat.
    - Respond politely and say you are ready to help.
    - End with: "Next: FINISH"

    SCENARIO 2: Needs leads, SEO, or business help.
    - If no leads yet: "Next: leadAgent"
    - If leads exist but no research: "Next: researcher"
    - If research exists but no SEO strategy: "Next: seoAgent"
    - If SEO strategy exists but no code: "Next: seniorDeveloper"
    - If everything is done: "Next: FINISH"

    SCENARIO 3: Technical or code help (no leads/SEO needed).
    - Go straight to: "Next: seniorDeveloper"

    SCENARIO 4: Specific SEO request.
    - Go straight to: "Next: seoAgent"

    Rules:
    - ALWAYS include "Next: [AgentName]" at the VERY end of your response.
  `;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

  const content = response.content.toString();
  
  // Extract the "Next: [Agent]" part
  const nextMatch = content.match(/Next:\s*(\w+)/);
  const nextAgent = nextMatch ? nextMatch[1] : "FINISH";

  // Clean up the message to the user by removing the "Next: ..." part
  const userMessage = content.replace(/Next:\s*\w+/, "").trim();

  return {
    next: nextAgent,
    messages: [new HumanMessage({ content: userMessage, name: "ceo" })],
  };
}
