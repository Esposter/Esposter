import type { AgentOptions } from "./AgentOptions";

/**
 * One recorded `agent()` call. The prompt is observable behaviour in its own right: a verifier told "do NOT
 * open" the file that settles its claim is a defect no assertion on the returned findings could catch.
 */
export interface AgentCall {
  label: string;
  options: AgentOptions;
  prompt: string;
}
