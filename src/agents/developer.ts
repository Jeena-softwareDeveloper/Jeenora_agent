import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";

/**
 * Senior Developer Agent
 * Responsibility: Takes research data and implements the actual code.
 */
export async function seniorDeveloper(state: AgentStateType) {
  console.log("--- STARTING SENIOR DEVELOPER ---");
  const research = state.researchData;
  
  const response = await model.invoke([
    new SystemMessage("You are a Senior Software Engineer. Use the provided research data to write high-quality, production-ready code. Focus on best practices, performance, and clean code principles."),
    new HumanMessage(`Research Data: ${research}\n\nBased on this research, please implement the solution.`),
  ]);

  return {
    finalCode: response.content.toString(),
    messages: [response],
  };
}
