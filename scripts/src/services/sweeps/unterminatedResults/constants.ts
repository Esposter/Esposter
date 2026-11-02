export const RESULT_CALLEE_NAMES: ReadonlySet<string> = new Set(["getResult", "getResultAsync"]);
// The two methods that return the value a chain ends in. Every combinator (`map`, `orTee`, `andThen`…) returns a Result
// Or ResultAsync still standing, so a chain ending in one of them is not terminated
export const TERMINATOR_NAMES: ReadonlySet<string> = new Set(["match", "unwrapOr"]);
