import type { ProcedureResolverOptions } from "#src/models/ProcedureResolverOptions";

// Only what a resolver on the real server reads, never the middleware chain's own plumbing
export const toResolverOptions = ({
  batchIndex,
  ctx,
  input,
  path,
  signal,
}: ProcedureResolverOptions<unknown, unknown>): ProcedureResolverOptions<unknown, unknown> => ({
  batchIndex,
  ctx,
  input,
  path,
  signal,
});
