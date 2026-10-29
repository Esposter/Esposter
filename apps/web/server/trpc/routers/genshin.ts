import type { SaveGenshinResult } from "#server/services/genshin/saveGenshin";
import type { StartGenshinResult } from "#server/services/genshin/startGenshin";

import { saveGenshinInputSchema } from "#server/models/genshin/SaveGenshinInput";
import { startGenshinInputSchema } from "#server/models/genshin/StartGenshinInput";
import { on } from "#server/services/events/on";
import { genshinEventEmitter } from "#server/services/genshin/events/genshinEventEmitter";
import { saveGenshin } from "#server/services/genshin/saveGenshin";
import { startGenshin } from "#server/services/genshin/startGenshin";
import { router } from "#server/trpc";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";

export const genshinRouter = router({
  onSessionReplaced: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    const events = on(genshinEventEmitter, "replaceSession", { signal });
    for await (const [[targetUserId, sessionId]] of events) if (targetUserId === userId) yield sessionId;
  }),
  saveGenshin: standardAuthedProcedure
    .input(saveGenshinInputSchema)
    .mutation<SaveGenshinResult>(({ ctx, input }) => saveGenshin(ctx.getSessionPayload.user.id, input)),
  startGenshin: standardAuthedProcedure
    .input(startGenshinInputSchema)
    .mutation<StartGenshinResult>(({ ctx, input }) => startGenshin(ctx.getSessionPayload.user.id, input.sessionId)),
});
