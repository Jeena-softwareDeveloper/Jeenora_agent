import { graph } from "./core/workflow";
import { HumanMessage } from "@langchain/core/messages";

async function testChat() {
  const testQuery = "Hi CEO, how are you today?";
  
  console.log("🚀 Testing General Chat Intent...");
  console.log(`📝 Query: "${testQuery}"\n`);

  const initialState = {
    messages: [new HumanMessage(testQuery)],
  };

  try {
    const stream = await graph.stream(initialState, {
      configurable: { thread_id: "test-user" },
    });

    for await (const step of stream) {
      const nodeName = Object.keys(step)[0];
      console.log(`\n✅ NODE COMPLETED: [${nodeName.toUpperCase()}]`);
      
      if (step.ceo) {
        console.log("🤵 CEO Response:", step.ceo.messages[0].content);
        console.log("🎯 CEO Decision:", step.ceo.next);
      }
    }
  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

testChat();
