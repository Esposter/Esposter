import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";

import { GameDataset } from "#src/models/data/GameDataset";
import { wishScheduleEventSchema } from "#src/models/wish/WishScheduleEvent";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The wish schedule's event banners, as `pnpm -C scripts genshinAssets wish-schedule` writes them from the wiki's wish
// Pages, read from the hosted game data and checked against their schema as they arrive
export const readWishSchedule = (gameDataBaseUrl: string): Promise<WishScheduleEvent[]> =>
  readGameData(gameDataBaseUrl, `${GameDataset.WishSchedule}/eventBanners`, z.array(wishScheduleEventSchema));
