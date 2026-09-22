import { VOICE_MODEL_DTYPE, VOICE_MODEL_ID } from "#src/services/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Whether the cache already holds the weights the engine loads: one ONNX graph per component, in the variant the
// Plugin declares, where the runtime lays the checkpoint down. A graph present is a graph complete, since the runtime
// Downloads to a temporary name and renames at the end. Read before the `voice` verb's foreground load, which exists
// To print a download's progress and has nothing to print over a cache that is complete
export const checkHasWeights = (modelsDirectory: string): boolean =>
  Object.entries(VOICE_MODEL_DTYPE).every(([component, dtype]) =>
    existsSync(join(modelsDirectory, VOICE_MODEL_ID, "onnx", `${component}_${dtype}.onnx`)),
  );
