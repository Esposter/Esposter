import type { LayerType } from "@@/scripts/tiled/models/LayerType";

import { outputFile } from "@@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@@/scripts/util/generateEnumString";
import { capitalize } from "@esposter/shared";

export const generateLayerNamesFile = async (directory: string, layerType: LayerType, layerNames: string[]) => {
  const enumName = `${capitalize(layerType)}Name`;
  await outputFile(`${directory}/${enumName}.ts`, generateEnumString(enumName, layerNames));
};
