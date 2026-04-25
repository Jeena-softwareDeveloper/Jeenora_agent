import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

/**
 * Global State Definition
 */
export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  researchData: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  finalCode: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  leads: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  seoData: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  next: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "ceo",
  }),
});

export type AgentStateType = typeof AgentState.State;
