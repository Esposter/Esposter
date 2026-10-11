import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Every transcript under a folder, subagent and workflow folders included, last written inside the window
export const readTranscriptFiles = (directory: string, sinceMs: number): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return readTranscriptFiles(path, sinceMs);
    if (!entry.name.endsWith(".jsonl") || statSync(path).mtimeMs < sinceMs) return [];
    return [path];
  });
