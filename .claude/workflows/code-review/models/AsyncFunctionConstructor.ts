/**
 * Constructs an async function from a parameter list and a body string — the shape the workflow script needs,
 * since it is an async function body rather than a module.
 */
export type AsyncFunctionConstructor = new (
  ...parameters: string[]
) => (...values: unknown[]) => Promise<Record<string, unknown>>;
