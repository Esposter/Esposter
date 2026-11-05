import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { DevCommand } from "#src/models/dev/DevCommand";

import { z } from "zod";

// `kills` answers the defeats the Archive counts, every Living Being's count added up, read from the kills as they are now
export const createKillsCommand = ({ getKills }: { getKills: () => ArchiveKills }): DevCommand => ({
  args: z.object({}),
  argumentNames: [],
  name: "kills",
  run: () => {
    let total = 0;
    for (const count of getKills().values()) total += count;

    return { ok: true, value: total };
  },
});
