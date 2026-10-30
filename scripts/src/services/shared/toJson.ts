// The text a JSON value is written as before the repository's formatter runs over it, which `formatText` and `formatJsonFile` do
export const toJson = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;
