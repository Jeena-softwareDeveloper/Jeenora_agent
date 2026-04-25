import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { AgentState } from "../types/state";
import { researcher, seniorDeveloper, leadAgent, ceo, seoAgent } from "../agents";

// Add a simple memory saver for short-term persistence
const checkpointer = new MemorySaver();

const workflow = new StateGraph(AgentState)
  .addNode("ceo", ceo)
  .addNode("leadAgent", leadAgent)
  .addNode("researcher", researcher)
  .addNode("seoAgent", seoAgent)
  .addNode("seniorDeveloper", seniorDeveloper)
  .addEdge(START, "ceo");

workflow.addConditionalEdges(
  "ceo",
  (state) => state.next,
  {
    leadAgent: "leadAgent",
    researcher: "researcher",
    seoAgent: "seoAgent",
    seniorDeveloper: "seniorDeveloper",
    FINISH: END,
  }
);

workflow.addEdge("leadAgent", "ceo");
workflow.addEdge("researcher", "ceo");
workflow.addEdge("seoAgent", "ceo");
workflow.addEdge("seniorDeveloper", "ceo");

// Compile with checkpointer for memory!
export const graph = workflow.compile({ checkpointer });
