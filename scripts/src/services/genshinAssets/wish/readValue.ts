// The value a parameter reads as, its last one where the page writes it more than once
export const readValue = (parameters: Map<string, string[]>, name: string): string | undefined =>
  parameters.get(name)?.at(-1);
