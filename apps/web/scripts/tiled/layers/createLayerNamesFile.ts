import type { LayerType } from "@@/scripts/tiled/models/LayerType";

import { outputFile } from "@@/scripts/services/outputFile";
import { TILED_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { createValueSetString } from "@@/scripts/util/createValueSetString";
import { capitalize } from "@esposter/shared";

export const createLayerNamesFile = async (directory: string, layerType: LayerType, layerNames: string[]) => {
  const valueSetName = `${capitalize(layerType)}Name`;
  await outputFile(
    TILED_ROOT_DIRECTORY,
    `${directory}/${valueSetName}.ts`,
    createValueSetString(valueSetName, layerNames),
  );
};
