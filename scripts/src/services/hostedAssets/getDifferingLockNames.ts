// The names whose hash differs between the two sides of one lock map, or that only one side holds, each named by its
// Kind So an object and an index under one key are told apart
export const getDifferingLockNames = (
  kind: string,
  generatedHashes: Record<string, string>,
  committedHashes: Record<string, string>,
): string[] =>
  [...new Set([...Object.keys(generatedHashes), ...Object.keys(committedHashes)])]
    .filter((name) => generatedHashes[name] !== committedHashes[name])
    .map((name) => `${kind} ${name}`);
