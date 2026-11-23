// A name as it compares: lowercased, with every whitespace character dropped
export const computeComparableName = (name: string): string => name.toLowerCase().replaceAll(/\s/gu, "");
