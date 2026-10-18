import type { BaseLandmark } from "#src/models/world/BaseLandmark";

import { DomainKind } from "#src/models/domains/DomainKind";
import { baseLandmarkSchema } from "#src/models/world/BaseLandmark";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// A domain's entrance, the place the player opens the domain's screen from. Its domain is the kind its game entry names,
// And its entry is the game's dungeon entry row it is read from
export interface DomainEntranceLandmark extends BaseLandmark {
  domainKind: DomainKind;
  entryId: number;
  kind: LandmarkKind.DomainEntrance;
}

export const domainEntranceLandmarkSchema = baseLandmarkSchema.safeExtend({
  domainKind: z.enum(DomainKind),
  entryId: z.int().positive(),
  kind: z.literal(LandmarkKind.DomainEntrance),
}) satisfies z.ZodType<DomainEntranceLandmark>;
