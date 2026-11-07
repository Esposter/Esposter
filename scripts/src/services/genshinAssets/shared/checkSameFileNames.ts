// Whether a folder holds exactly the files the index names, by name and by count, in any order: a file the index does not
// Name, or one it names and the folder lacks, means the folder is exported again
export const checkSameFileNames = (expectedNames: readonly string[], fileNames: readonly string[]): boolean => {
  const expected = expectedNames.toSorted();
  const actual = fileNames.toSorted();
  return expected.length === actual.length && expected.every((name, index) => name === actual[index]);
};
