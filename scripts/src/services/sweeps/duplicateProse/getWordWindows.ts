// Every run of `size` consecutive words, joined the way a shingle is keyed, in the order they start
export const getWordWindows = (words: string[], size: number): string[] => {
  const windows: string[] = [];
  for (let index = 0; index + size <= words.length; index++) windows.push(words.slice(index, index + size).join(" "));
  return windows;
};
