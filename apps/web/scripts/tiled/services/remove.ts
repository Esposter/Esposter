import { TILED_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { rm } from "node:fs/promises";

export const remove = (directory?: string) => {
  const path = directory ? `/${directory}` : "";
  return rm(`${TILED_ROOT_DIRECTORY}${path}`, { force: true, recursive: true });
};
