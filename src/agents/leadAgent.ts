import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentStateType } from "../types/state";
import { model } from "../config/llm";
import { searchLeads } from "../tools/search";

/**
 * Lead Generation Agent
 * Responsibility: Finds potential leads based on the user query.
 */
export async function leadAgent(state: AgentStateType) {
  console.log("--- STARTING LEAD GENERATION AGENT ---");
  const lastMessage = state.messages[state.messages.length - 1];
  
  // 1. Identify what to search
  const response = await model.invoke([
    new SystemMessage(`
      You are the Lead Generation Expert for Jeenora.com. 
      Extract a search query for finding business leads based on the user's request.
      Output ONLY the search query. Example: "AI consultants in London".
    `),
    new HumanMessage(lastMessage.content.toString()),
  ]);

  // 2. Call the search tool (using mock data for now)
  const results = await searchLeads(response.content.toString());
  
  const leadStrings = results.map((l: any) => `${l.name} - ${l.contact} [${l.niche}]`);

  return {
    leads: leadStrings,
    messages: [response],
  };
}
