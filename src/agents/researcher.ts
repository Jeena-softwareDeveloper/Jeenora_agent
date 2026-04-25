import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";

/**
 * Researcher Agent
 * Responsibility: Analyzes the user request and provides technical context.
 */
export async function researcher(state: AgentStateType) {
  console.log("--- STARTING RESEARCHER ---");
  const lastMessage = state.messages[state.messages.length - 1];
  
  const response = await model.invoke([
    new SystemMessage("You are a Senior Technical Researcher at Jeenora.com. Your job is to analyze lead data and provide a detailed technical plan or business strategy for outreach."),
    new HumanMessage(lastMessage.content.toString()),
  ]);

  return {
    researchData: response.content.toString(),
    messages: [response],
  };
}
