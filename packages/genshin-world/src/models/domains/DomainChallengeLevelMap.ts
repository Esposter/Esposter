import type { DomainChallengeLevel } from "#src/models/domains/DomainChallengeLevel";

import { domainChallengeLevelSchema } from "#src/models/domains/DomainChallengeLevel";
import { z } from "zod";

// Every domain's challenge levels by its entrance's entry id, and then by each level's recommended rank, as the
// Authored file holds them
export type DomainChallengeLevelMap = Record<string, Record<string, DomainChallengeLevel>>;

export const domainChallengeLevelMapSchema = z.record(
  z.string(),
  z.record(z.string(), domainChallengeLevelSchema),
) satisfies z.ZodType<DomainChallengeLevelMap>;
