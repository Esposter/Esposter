// Stands in for `cloudflare:workers`, which only the Workers runtime provides: the test runners alias that module to
// This File, the package's `cloudflare-workers` entry, which imports nothing. `createMockDb` copies its Miniflare
// Bindings Into `env`, so a binding read through it is the file's own and a read before `createMockDb` has run finds
// Nothing.
export const env: Record<string, unknown> = {};

// Stands in for the runtime's base class, which only the Workers runtime provides, and holds the ctx and env given to
// It.
export class DurableObject<Env = unknown> {
  readonly ctx: unknown;
  readonly env: Env;

  constructor(ctx: unknown, environment: Env) {
    this.ctx = ctx;
    this.env = environment;
  }
}
