// The arguments of one of an object's RPC methods, as its RPC interface declares them
export type MethodArgs<TRpc, TMethod extends keyof TRpc> = TRpc[TMethod] extends (...args: infer TArgs) => unknown
  ? TArgs
  : never;
