import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";
import { useBrowser } from "../tools/browser";

/**
 * Deep Thinker Agent (The Autonomous Executor)
 * Responsibility: Solve complex web-based tasks using self-thinking and browser interaction.
 */
export async function deepThinker(state: AgentStateType) {
  console.log("--- 🧠 DEEP THINKER IS ANALYZING & PLANNING ---");
  
  const lastMessage = state.messages[state.messages.length - 1];
  
  // 1. Brainstorm and create a browser plan
  const planResponse = await model.invoke([
    new SystemMessage(`
      You are the Deep Thinker for Jeenora.com. 
      Analyze the user request and create a multi-step browser plan.
      If you need to login or index something, describe the steps.
      Output your internal thinking and then the required browser actions in JSON format.
      Example: 
      Thinking: I need to check Google Search Console...
      Actions: [{"action": "navigate", "target": "https://search.google.com/search-console"}]
    `),
    new HumanMessage(lastMessage.content.toString()),
  ]);

  const planText = planResponse.content.toString();
  console.log(`Plan: ${planText}`);

  // 2. Extract actions and execute them (Simplified for demonstration)
  // In a real scenario, we'd use a parser, but here we look for the JSON array.
  const jsonMatch = planText.match(/\[.*\]/s);
  let executionResult = "No actions executed.";
  
  if (jsonMatch) {
    try {
      const actions = JSON.parse(jsonMatch[0]);
      executionResult = await useBrowser(actions);
    } catch (e) {
      executionResult = `Error parsing or executing plan: ${e.message}`;
    }
  }

  return {
    thinkingLogs: [planText],
    finalCode: `Execution Report: ${executionResult}`,
    messages: [new HumanMessage({ content: `Deep Thinking Result: ${executionResult}`, name: "deepThinker" })],
  };
}
