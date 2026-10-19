import type { DomainChallengeEnemy } from "#src/models/domains/DomainChallengeEnemy";

import { domainChallengeEnemySchema } from "#src/models/domains/DomainChallengeEnemy";
import { z } from "zod";

// A challenge level: the defeats it asks for within its time limit, and each wave's enemy groups, the wave held as its
// Groups' members
export interface DomainChallengeLevel {
  // The defeats the level asks for within its time limit
  defeatTarget: number;
  timeLimitSeconds: number;
  // Each wave's enemy groups, the wave held as its groups' members
  waves: DomainChallengeEnemy[][];
}

export const domainChallengeLevelSchema = z.object({
  defeatTarget: z.int().positive(),
  // A level with no time limit is held as null, since JSON cannot hold an infinite number
  // eslint-disable-next-line no-restricted-syntax -- published game data holds null for a level with no time limit, since JSON cannot hold an infinite number
  timeLimitSeconds: z
    .int()
    .positive()
    .nullable()
    .transform((timeLimit) => timeLimit ?? Number.POSITIVE_INFINITY),
  waves: z.array(z.array(domainChallengeEnemySchema)),
}) satisfies z.ZodType<DomainChallengeLevel>;
