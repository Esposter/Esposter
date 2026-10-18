import type { BaseLandmark } from "#src/models/world/BaseLandmark";
import type { LandmarkArrival } from "#src/models/world/LandmarkArrival";

import { DomainKind } from "#src/models/domains/DomainKind";
import { baseLandmarkSchema } from "#src/models/world/BaseLandmark";
import { landmarkArrivalSchema } from "#src/models/world/LandmarkArrival";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// A domain's entrance, the place the player opens the domain's screen from and jumps to once unlocked. Its domain is the
// Kind its game entry names, and its entry is the game's dungeon entry row it is read from. Its arrival is provisionally
// Its own place, until the domain's scene export gives the transfer point a jump lands at
export interface DomainEntranceLandmark extends BaseLandmark {
  arrival: LandmarkArrival;
  domainKind: DomainKind;
  entryId: number;
  kind: LandmarkKind.DomainEntrance;
}

export const domainEntranceLandmarkSchema = baseLandmarkSchema.safeExtend({
  arrival: landmarkArrivalSchema,
  domainKind: z.enum(DomainKind),
  entryId: z.int().positive(),
  kind: z.literal(LandmarkKind.DomainEntrance),
}) satisfies z.ZodType<DomainEntranceLandmark>;
