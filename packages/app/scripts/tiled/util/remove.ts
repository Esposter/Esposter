import { ROOT_DIRECTORY } from "@/scripts/tiled/util/constants";
import { remove as baseRemove } from "fs-extra";

export const remove = (dir?: Parameters<typeof baseRemove>[0]) => {
  const path = dir ? `/${dir}` : "";
  return baseRemove(`${ROOT_DIRECTORY}${path}`);
};
