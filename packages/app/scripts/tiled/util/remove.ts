import { TILED_ROOT_DIRECTORY } from "@/scripts/tiled/constants";
import { remove as baseRemove } from "fs-extra";

export const remove = (dir?: Parameters<typeof baseRemove>[0]) => {
  const path = dir ? `/${dir}` : "";
  return baseRemove(`${TILED_ROOT_DIRECTORY}${path}`);
};
