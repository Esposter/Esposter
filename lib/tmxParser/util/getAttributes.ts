export const getAttributes = <T extends object>($: T): Record<string, unknown>[] =>
  Object.entries($).map(([key, value]) => ({ [key as string]: value }));
