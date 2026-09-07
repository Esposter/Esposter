import type { LayerType } from "@@/scripts/tiled/models/LayerType";

import { outputFile } from "@@/scripts/tiled/util/outputFile";
import { createEnumString } from "@@/scripts/util/createEnumString";
import { capitalize } from "@esposter/shared";

export const createLayerNamesFile = async (directory: string, layerType: LayerType, layerNames: string[]) => {
  const enumName = `${capitalize(layerType)}Name`;
  await outputFile(`${directory}/${enumName}.ts`, createEnumString(enumName, layerNames));
};
