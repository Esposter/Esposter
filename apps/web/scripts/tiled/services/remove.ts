import { TILED_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { remove as baseRemove } from "fs-extra";

export const remove = (directory?: Parameters<typeof baseRemove>[0]) => {
  const path = directory ? `/${directory}` : "";
  return baseRemove(`${TILED_ROOT_DIRECTORY}${path}`);
};
