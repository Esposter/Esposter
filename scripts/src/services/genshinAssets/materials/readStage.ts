import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedSubProgramRecord } from "#src/models/genshinAssets/materials/SerializedSubProgramRecord";

import { readSerializedSubProgram } from "#src/services/genshinAssets/materials/readSerializedSubProgram";

// A pass's stage lists in the order Unity writes them, vertex to domain and then ray tracing, which is read past
export const readStage = (cursor: BinaryCursor): SerializedSubProgramRecord[] =>
  cursor.list(() => readSerializedSubProgram(cursor));
