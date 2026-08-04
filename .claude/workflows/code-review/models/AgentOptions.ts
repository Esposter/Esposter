/** The option bag the workflow passes to `agent()` — the parts a test asserts on. */
export interface AgentOptions {
  effort?: string;
  label?: string;
  model?: string;
  phase?: string;
  schema?: { required?: string[] };
}
