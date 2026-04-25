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
  
  const systemPrompt = `
    You are the Deep Thinker for Jeenora.com. 
    Your primary target is always https://jeenora.com unless another URL is explicitly provided.
    
    Tasks:
    1. Analyze the user request.
    2. If it's about SEO or Indexing, navigate to https://jeenora.com or Google Search Console.
    3. Create a multi-step browser plan.
    4. Output your thinking followed by browser actions in JSON format.
    
    CRITICAL: Always use https://jeenora.com for internal checks. Never use example.com.
  `;

  // 1. Brainstorm and create a browser plan
  const planResponse = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(lastMessage.content.toString()),
  ]);

  const planText = planResponse.content.toString();
  console.log(`Plan: ${planText}`);

  // 2. Extract actions and execute them
  const jsonMatch = planText.match(/\[.*\]/s);
  let executionResult = "No actions executed.";
  
  if (jsonMatch) {
    try {
      const actions = JSON.parse(jsonMatch[0]);
      // Safety check: ensure we are not navigating to example.com
      const safeActions = actions.map((a: any) => {
        if (a.target && a.target.includes("example.com")) {
          a.target = "https://jeenora.com";
        }
        return a;
      });
      executionResult = await useBrowser(safeActions);
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
