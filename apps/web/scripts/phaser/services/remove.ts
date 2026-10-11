import { PHASER_ROOT_DIRECTORY } from "@@/scripts/phaser/constants";
import { rm } from "node:fs/promises";

export const remove = (directory?: string) => {
  const path = directory ? `/${directory}` : "";
  return rm(`${PHASER_ROOT_DIRECTORY}${path}`, { force: true, recursive: true });
};
