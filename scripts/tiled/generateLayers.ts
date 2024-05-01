import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import { LayerType } from "@/scripts/tiled/models/LayerType";
import { outputFile } from "@/scripts/tiled/util/outputFile";
import { getEnumString } from "@/scripts/util/getEnumString";
import { capitalize } from "vue";

const directory = "layers";

export const generateLayers = async (layers: TMXLayer[]) => {
  for (const layerType of Object.values(LayerType)) {
    const enumName = `${capitalize(layerType)}Name`;
    await outputFile(
      `${directory}/${enumName}.ts`,
      getEnumString(
        enumName,
        layers.filter(({ type }) => type === layerType).map((l) => l.name),
      ),
    );
  }
};
