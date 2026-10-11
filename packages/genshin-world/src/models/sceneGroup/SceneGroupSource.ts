import { z } from "zod";

// The source that filled a field of the scene group record: the hosted NPC births (`sceneNpcBorn/scene3`), the official
// Map's points carried into the scene by its fit, the dump's scene points, the trigger table or the viewpoint codex. Each
// Member names the one that named it and each place the one that placed it, so a refill from the client's group scripts
// Can be told from what it replaced
export enum SceneGroupSource {
  NpcBirths = "NpcBirths",
  OfficialMap = "OfficialMap",
  ScenePoints = "ScenePoints",
  TriggerTable = "TriggerTable",
  ViewCodex = "ViewCodex",
}

export const sceneGroupSourceSchema = z.enum(SceneGroupSource) satisfies z.ZodType<SceneGroupSource>;
