import { PHASER_ROOT_DIRECTORY } from "@@/scripts/phaser/constants";
import { outputFile as baseOutputFile } from "fs-extra";

export const outputFile = (file: Parameters<typeof baseOutputFile>[0], data: Parameters<typeof baseOutputFile>[1]) => {
  const path = file ? `/${file}` : file;
  return baseOutputFile(`${PHASER_ROOT_DIRECTORY}${path}`, data);
};
