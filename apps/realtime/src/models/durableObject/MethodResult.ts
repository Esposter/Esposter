// The result of one of an object's RPC methods, as its RPC interface declares it
export type MethodResult<TRpc, TMethod extends keyof TRpc> = TRpc[TMethod] extends (...args: never[]) => infer TResult
  ? Awaited<TResult>
  : never;
