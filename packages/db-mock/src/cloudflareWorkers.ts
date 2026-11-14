// Stands in for `cloudflare:workers`, which only the Workers runtime provides: the test runner aliases that module to this
// package. `createMockDb` copies its Miniflare bindings into `env`, so a binding read through it is the file's own and a
// read before `createMockDb` has run finds nothing.
export const env: Record<string, unknown> = {};

// Stands in for the runtime's base class, which only the Workers runtime provides, and holds the ctx and env given to it.
export class DurableObject<Env = unknown> {
  readonly ctx: unknown;
  readonly env: Env;

  constructor(ctx: unknown, environment: Env) {
    this.ctx = ctx;
    this.env = environment;
  }
}
