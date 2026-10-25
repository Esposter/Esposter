import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

// A file's lines, its stream opened only when the merge reaches the file: a line interface opened earlier reads its
// File in the background and loses the lines it reads before anything listens, then never ends
export const readFileLines = async function* (path: string): AsyncGenerator<string> {
  for await (const line of createInterface({ crlfDelay: Infinity, input: createReadStream(path, "utf8") })) yield line;
};
