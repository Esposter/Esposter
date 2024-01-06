export const parse = (serializedCursors: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(serializedCursors, "base64").toString());
