// The text a manifest is written as before the repository's formatter runs over it, which `formatText` does
export const toJson = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;
