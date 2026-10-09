import type { SaveGenshinResult } from "#server/services/genshin/saveGenshin";
import type { StartGenshinResult } from "#server/services/genshin/startGenshin";

import { saveGenshinInputSchema } from "#server/models/genshin/SaveGenshinInput";
import { saveGenshin } from "#server/services/genshin/saveGenshin";
import { startGenshin } from "#server/services/genshin/startGenshin";
import { router } from "#server/trpc";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";

export const genshinRouter = router({
  saveGenshin: standardAuthedProcedure
    .input(saveGenshinInputSchema)
    .mutation<SaveGenshinResult>(({ ctx, input }) => saveGenshin(ctx.getSessionPayload.user.id, input)),
  startGenshin: standardAuthedProcedure.mutation<StartGenshinResult>(({ ctx }) =>
    startGenshin(ctx.getSessionPayload.user.id),
  ),
});
