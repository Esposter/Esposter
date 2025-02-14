import { PHASER_ROOT_DIRECTORY } from "@@/scripts/phaser/constants";
import { remove as baseRemove } from "fs-extra";

export const remove = (dir?: Parameters<typeof baseRemove>[0]) => {
  const path = dir ? `/${dir}` : "";
  return baseRemove(`${PHASER_ROOT_DIRECTORY}${path}`);
};
