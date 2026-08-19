import type { AgentOptions } from "./AgentOptions";

/**
 * Answers one agent call. Returning null models an agent that died, which several of the workflow's contracts
 * turn on — a run whose resolvers all failed must not read as a clean one.
 */
export type AgentStub = (prompt: string, options: AgentOptions) => unknown;
