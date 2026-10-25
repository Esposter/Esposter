import { readdirSync } from "node:fs";
import { join } from "node:path";

// Every JSON file under `directory` at any depth
export const walkJsonFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walkJsonFiles(path);
    return entry.name.endsWith(".json") ? [path] : [];
  });
