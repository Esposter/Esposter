import { PHASER_ROOT_DIRECTORY } from "#scripts/phaser/constants";
import { rm } from "node:fs/promises";

export const remove = () => rm(PHASER_ROOT_DIRECTORY, { force: true, recursive: true });
