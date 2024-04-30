import { outputFile } from "@/scripts/tiled/util/outputFile";
import { getEnumString } from "@/scripts/util/getEnumString";

export const generateLayerName = async (_tilemap: Record<string, unknown>) => {
  const enumName = "LayerName";
  const layerNames: string[] = [];
  await outputFile(`${enumName}.ts`, getEnumString(enumName, layerNames));
};
