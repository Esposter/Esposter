import { InvalidOperationError, Operation } from "@esposter/shared";

export const replaceCounted = (source: string, search: string, replacement: string, expected: number): string => {
  const occurrences = source.split(search).length - 1;
  if (occurrences !== expected)
    throw new InvalidOperationError(
      Operation.Update,
      "kraken.cpp",
      `has ${occurrences} of ${JSON.stringify(search)} where ${expected} were expected at this commit`,
    );
  return source.replaceAll(search, replacement);
};
