import { BannerKind } from "genshin-interface";
import { z } from "zod";

// One event banner of the schedule the wiki's wish pages give: its page's title as its id, its kind, its window as epoch
// Milliseconds and the game's ids of its featured five-stars and four-stars. The published record holds ids and times only
export interface WishScheduleEvent {
  endTime: number;
  fiveStarIds: number[];
  fourStarIds: number[];
  id: string;
  kind: BannerKind;
  startTime: number;
}

export const wishScheduleEventSchema = z.object({
  endTime: z.int(),
  fiveStarIds: z.array(z.int().positive()),
  fourStarIds: z.array(z.int().positive()),
  id: z.string().min(1),
  kind: z.enum([BannerKind.CharacterEvent, BannerKind.WeaponEvent]),
  startTime: z.int(),
}) satisfies z.ZodType<WishScheduleEvent>;
