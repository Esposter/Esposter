import { ROOT_DIRECTORY } from "@/scripts/tiled/util/constants";
import { outputFile as baseOutputFile } from "fs-extra/esm";

export const outputFile = (file: Parameters<typeof baseOutputFile>[0], data: Parameters<typeof baseOutputFile>[1]) => {
  const path = file ? `/${file}` : file;
  return baseOutputFile(`${ROOT_DIRECTORY}${path}`, data);
};
