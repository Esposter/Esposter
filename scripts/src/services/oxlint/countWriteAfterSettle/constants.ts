import { SERVER_COUNT_FIELDS } from "@esposter/configuration/eslint/serverCountFields.js";

export const MESSAGE =
  "A server-derived count is written before its mutation settles, so it moves before the server answers. Re-read the count after the write settles instead. See openspec/specs/architecture/client-data/design.md.";
// The fields the server derives as counts, shared with the `no-restricted-syntax` selectors so they agree on which are counts
export const COUNT_FIELDS: ReadonlySet<string> = new Set(SERVER_COUNT_FIELDS);
// A role's count is the `count` of an item of the list it sits in, as in `countsByTopRole[i].count`
export const COUNT_ROLE_FIELD = "count";
// The tRPC client's mutation, the one call that sends a write, whatever wraps it
export const MUTATION_METHOD = "mutate";
// The option a mutation runs its optimistic change through, when the write is sent and before the server answers
export const APPLY_OPTIMISTIC_KEY = "applyOptimistic";
