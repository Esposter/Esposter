// A path ID is 64 bits, past a number's exact range, so it is kept as the text the export wrote
export const readPathIdText = (key: string, value: unknown, context: { source?: string }): unknown =>
  key === "m_PathID" && typeof value === "number" && context.source !== undefined ? context.source : value;
