import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";

/**
 * Technical Researcher Agent
 */
export async function researcher(state: AgentStateType) {
  console.log("--- 🔍 STARTING TECHNICAL RESEARCHER ---");
  
  const leads = state.leads.join(", ");
  const lastMessage = state.messages[state.messages.length - 1];

  const systemPrompt = `
    You are the Technical Researcher for Jeenora.com. 
    Analyze the following leads and the user request:
    Leads: ${leads}
    
    Tasks:
    1. Research the business model of these leads.
    2. Identify their technical needs or pain points.
    3. Suggest how Jeenora.com can help them.
  `;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(lastMessage.content.toString()),
  ]);

  return {
    researchData: response.content.toString(),
    messages: [response],
  };
}
