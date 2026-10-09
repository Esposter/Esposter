import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every JSON file under `directory` at any depth, skipping `excludedDirectory`, which holds the name chunks this run writes
const walkJsonFiles = (directory: string, excludedDirectory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return path === excludedDirectory ? [] : walkJsonFiles(path, excludedDirectory);
    return entry.name.endsWith(".json") ? [path] : [];
  });

// Adds the `nameTextId` of every row at any depth, so a nested one is found the same as a top-level one
const collectNameTextIds = (value: unknown, textIds: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) collectNameTextIds(item, textIds);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value))
    if (key === "nameTextId") textIds.add(String(child));
    else collectNameTextIds(child, textIds);
};

// The text id of every name the world's data cites, found by walking its folders, so a new source needs no edit here
export const readNameTextIds = (directories: string[], excludedDirectory: string): string[] => {
  const textIds = new Set<string>();
  for (const directory of directories)
    for (const path of walkJsonFiles(directory, excludedDirectory))
      collectNameTextIds(parseMachineJson(readFileSync(path, "utf8")), textIds);
  return [...textIds].toSorted();
};
