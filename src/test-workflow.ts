import { graph } from "./core/workflow";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Senior Developer Test Script
 * This script bypasses Telegram to test the core Multi-Agent logic.
 */
async function testWorkflow() {
  const testQuery = "Find 2 leads for AI consultants in London and write a brief outreach strategy for them.";
  
  console.log("🚀 Starting Core Workflow Test...");
  console.log(`📝 Query: "${testQuery}"\n`);

  const initialState = {
    messages: [new HumanMessage(testQuery)],
  };

  try {
    // We use stream to see the progress of each node
    const stream = await graph.stream(initialState);

    for await (const step of stream) {
      const nodeName = Object.keys(step)[0];
      console.log(`\n✅ NODE COMPLETED: [${nodeName.toUpperCase()}]`);
      
      // Log specific data based on the node
      if (step.leadAgent?.leads) {
        console.log("📍 Leads Found:", step.leadAgent.leads);
      }
      if (step.ceo?.next) {
        console.log("🎯 CEO's Next Decision:", step.ceo.next);
      }
    }

    console.log("\n========================================");
    console.log("✨ TEST COMPLETED SUCCESSFULLY");
    console.log("========================================\n");

  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

testWorkflow();
