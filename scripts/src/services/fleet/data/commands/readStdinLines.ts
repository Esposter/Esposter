import { createInterface } from "node:readline";

// The non-empty lines of stdin, read to its end. Only a verb that is told to read stdin calls this: a piped stdin
// Left open never ends, so the other verbs must not wait on it
export const readStdinLines = async (): Promise<string[]> => {
  const lines: string[] = [];
  for await (const line of createInterface({ crlfDelay: Infinity, input: process.stdin }))
    if (line !== "") lines.push(line);
  return lines;
};
