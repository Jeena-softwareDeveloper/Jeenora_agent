import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";

/**
 * Senior Developer Agent
 * Now smarter: It analyzes Leads, Research, AND SEO data.
 */
export async function seniorDeveloper(state: AgentStateType) {
  console.log("--- 💻 STARTING SENIOR DEVELOPER ---");
  
  const lastMessage = state.messages[state.messages.length - 1];
  
  const context = `
    Business Context:
    - Leads: ${state.leads.join(", ")}
    - Business Research: ${state.researchData || "No technical research yet."}
    - SEO Audit Data: ${state.seoData || "No SEO audit performed yet."}
  `;

  const systemPrompt = `
    You are the Senior Developer for Jeenora.com. 
    Analyze the provided context (Leads, Research, and SEO) and create a production-ready implementation plan.
    
    If SEO data is provided, focus on:
    1. Technical fixes for the website.
    2. How to implement the suggested keyword strategy.
    3. Improving performance based on audit results.

    Provide clean, documented code snippets or a detailed technical roadmap. 
    Always follow Jeenora's premium branding.
  `;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new SystemMessage(context),
    new HumanMessage(lastMessage.content.toString()),
  ]);

  return {
    finalCode: response.content.toString(),
    messages: [response],
  };
}
