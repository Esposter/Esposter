// A `JSON.parse` reviver keeping every path ID as its source text: a path ID is 64 bits, past what a number holds
// Exactly, so two assets whose IDs round alike would otherwise read as one
export const reviveSourcePathId = (key: string, value: unknown, { source }: { source?: string }): unknown =>
  key === "m_PathID" && source !== undefined ? source : value;
