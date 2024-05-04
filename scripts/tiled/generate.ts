import { generatePropertyTypes } from "@/scripts/tiled/generatePropertyTypes";
import { generateLayers } from "@/scripts/tiled/layers/generateLayers";
import { remove } from "@/scripts/tiled/util/remove";

await remove();
await generatePropertyTypes();
await generateLayers();
