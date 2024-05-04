import type { LayerType } from "@/scripts/tiled/models/LayerType";
import { outputFile } from "@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@/scripts/util/generateEnumString";
import { capitalize } from "vue";

export const generateLayerNames = async (directory: string, layerType: LayerType, layerMembers: Set<string>) => {
  const enumName = `${capitalize(layerType)}Name`;
  await outputFile(`${directory}/${enumName}.ts`, generateEnumString(enumName, [...layerMembers]));
};
