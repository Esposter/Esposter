import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

// Rewrite a file only when the edit changed it, and say which node floor it now carries
export const updateNodeFloorFile = (path: string, version: string, setFloor: (text: string) => string): void => {
  const text = readFileSync(path, "utf8");
  const updatedText = setFloor(text);
  if (updatedText === text) return;

  writeFileSync(path, updatedText);
  console.info(`✔ ${relative(REPOSITORY_ROOT, path)} node → >=${version}`);
};
