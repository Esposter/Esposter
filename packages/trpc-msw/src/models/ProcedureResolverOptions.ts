export interface ProcedureResolverOptions<TContext, TInput> {
  // The call's position in a batch, when it arrived in one
  batchIndex?: number;
  ctx: TContext;
  input: TInput;
  path: string;
  signal?: AbortSignal;
}
