// Stands in for `cloudflare:workers`, which only the Workers runtime provides: the test runner aliases that module to this
// package. `createMockDb` copies its Miniflare bindings into `env`, so a binding read through it is the file's own and a
// read before `createMockDb` has run finds nothing.
export const env: Record<string, unknown> = {};
