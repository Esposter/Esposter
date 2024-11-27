import { TILED_ROOT_DIRECTORY } from "@/scripts/tiled/util/constants";
import { outputFile as baseOutputFile } from "fs-extra";

export const outputFile = (file: Parameters<typeof baseOutputFile>[0], data: Parameters<typeof baseOutputFile>[1]) => {
  const path = file ? `/${file}` : file;
  return baseOutputFile(`${TILED_ROOT_DIRECTORY}${path}`, data);
};
