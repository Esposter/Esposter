import type { SceneLayout } from "genshin-engine";

import { sceneMaterialSchema } from "#src/models/scene/SceneMaterial";
import { scenePlacementSchema } from "#src/models/scene/ScenePlacement";
import { MAX_MATERIAL_COUNT } from "#src/services/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

export const sceneLayoutSchema = z.object({
  materials: createRecordSchema(z.string().min(1), sceneMaterialSchema, MAX_MATERIAL_COUNT),
  placements: z.array(scenePlacementSchema),
}) satisfies z.ZodType<SceneLayout>;
