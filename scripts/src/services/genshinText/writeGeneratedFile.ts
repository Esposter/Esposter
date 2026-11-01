import { formatGeneratedSource } from "#src/services/shared/formatGeneratedSource";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Written as the formatter writes it, through its API: a file under `generated/` is one its command line ignores
export const writeGeneratedFile = async (path: string, source: string): Promise<void> => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, await formatGeneratedSource(path, source));
};
