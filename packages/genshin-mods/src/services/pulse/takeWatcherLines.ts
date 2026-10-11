// Splits the watcher's output into the whole lines its chunks have made so far. The text after the last newline is held
// For the next chunk, since a chunk may end mid-line
export const takeWatcherLines = (pending: string, text: string): { lines: string[]; pending: string } => {
  const parts = `${pending}${text}`.split("\n");
  return { lines: parts.slice(0, -1), pending: parts.at(-1) ?? "" };
};
