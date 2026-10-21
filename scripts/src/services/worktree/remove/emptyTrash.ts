import { mkdirSync, readdirSync, rm } from "node:fs";
import { join } from "node:path";

// A binary moved aside by an earlier removal is deleted once nothing has it loaded; one still loaded is kept for a later
// removal, so a refused deletion is not an error
export const emptyTrash = (trashPath: string): void => {
  mkdirSync(trashPath, { recursive: true });
  for (const name of readdirSync(trashPath)) rm(join(trashPath, name), { force: true }, () => undefined);
};
