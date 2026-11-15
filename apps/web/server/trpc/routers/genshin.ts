import type { SaveGenshinResult } from "#server/services/genshin/saveGenshin";
import type { StartGenshinResult } from "#server/services/genshin/startGenshin";

import { saveGenshinInputSchema } from "#server/models/genshin/SaveGenshinInput";
import { startGenshinInputSchema } from "#server/models/genshin/StartGenshinInput";
import { saveGenshin } from "#server/services/genshin/saveGenshin";
import { startGenshin } from "#server/services/genshin/startGenshin";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";

export const genshinRouter = router({
  saveGenshin: standardAuthedProcedure
    .meta({ staticReason: "Only the session holding the lease reads or writes the save, so no other reader shows it" })
    .input(saveGenshinInputSchema)
    .mutation<SaveGenshinResult>(({ ctx, input }) => saveGenshin(ctx.user.id, input)),
  startGenshin: standardAuthedProcedure
    .meta({
      staticReason:
        "The user object tells the session a start replaces that its lease is gone, so no query is refetched",
    })
    .input(startGenshinInputSchema)
    .mutation<StartGenshinResult>(({ ctx, input }) => startGenshin(ctx.user.id, input.sessionId)),
});
