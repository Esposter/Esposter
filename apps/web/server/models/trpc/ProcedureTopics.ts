import type { Topic } from "@esposter/db-schema";

// The topics a query's result reads or a mutation changed, derived from the call
export type ProcedureTopics = (options: ProcedureTopicsOptions) => Topic[];

export interface ProcedureTopicsOptions {
  // The call's raw input, which `getProcedureTopics` parses by the procedure's own schema
  input: unknown;
  // A mutation's result, for a topic only the write names, such as a created row's id. A query's topics never read it
  output: unknown;
  // The session's user, absent on a public procedure called without one
  userId?: string;
}
