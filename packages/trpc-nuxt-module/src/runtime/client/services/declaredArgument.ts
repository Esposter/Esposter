// The proxy hands each argument over as `unknown`, and the call's own signature declares the type it takes. The untyped
// Hand-over is asserted here once, and the call that names the type takes no cast of its own; `TRPCNuxtClient` checked
// The argument where the call was written
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the declared type is named by the call and carried only by the return, which is the point of the helper
export const declaredArgument = <T>(argument: unknown): T =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the proxy types the argument as unknown, and the call's signature declares the type it takes, which the compiler cannot carry through the proxy
  argument as T;
