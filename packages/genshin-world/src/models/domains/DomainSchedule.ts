import { DomainKind } from "#src/models/domains/DomainKind";
import { z } from "zod";

// One level of a challenge domain as the game's tables set it: its dungeon, the recommended Adventure Rank and the
// Enemies' level it is set at, and the days of the week its pair is set for. A Domain of Blessing's levels are set for
// Every day
export const domainLevelSchema = z.object({
  dungeonId: z.number().int(),
  enemyLevel: z.number().int(),
  recommendedRank: z.number().int(),
  scheduledDaysOfWeek: z.array(z.number().int().min(1).max(7)),
});

// A challenge domain's kind and its levels, read by its entrance's entry id
export const domainScheduleSchema = z.object({ kind: z.enum(DomainKind), levels: z.array(domainLevelSchema) });

export type DomainLevel = z.infer<typeof domainLevelSchema>;
export type DomainSchedule = z.infer<typeof domainScheduleSchema>;
