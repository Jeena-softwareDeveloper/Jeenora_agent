import { ChatOpenAI } from "@langchain/openai";
import { config } from "./env";

/**
 * Shared LLM instance
 */
export const model = new ChatOpenAI({
  apiKey: config.deepseek.apiKey,
  configuration: {
    baseURL: config.deepseek.baseURL,
  },
  modelName: "deepseek-chat",
  temperature: 0.7,
});
