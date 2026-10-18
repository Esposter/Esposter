import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";
import type { CharacterPackUploadGrant } from "#server/models/genshin/CharacterPackUploadGrant";
import type { SaveGenshinResult } from "#server/services/genshin/saveGenshin";
import type { StartGenshinResult } from "#server/services/genshin/startGenshin";

import { generateCharacterPackUploadSasUrlsInputSchema } from "#server/models/genshin/GenerateCharacterPackUploadSasUrlsInput";
import { keepCharacterPackInputSchema } from "#server/models/genshin/KeepCharacterPackInput";
import { removeCharacterPackInputSchema } from "#server/models/genshin/RemoveCharacterPackInput";
import { saveGenshinInputSchema } from "#server/models/genshin/SaveGenshinInput";
import { startGenshinInputSchema } from "#server/models/genshin/StartGenshinInput";
import { on } from "#server/services/events/on";
import { generateAccountCharacterPackUploadSasUrls } from "#server/services/genshin/accountCharacterPack/generateAccountCharacterPackUploadSasUrls";
import { keepAccountCharacterPack } from "#server/services/genshin/accountCharacterPack/keepAccountCharacterPack";
import { readAccountCharacterPacks } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPacks";
import { removeAccountCharacterPack } from "#server/services/genshin/accountCharacterPack/removeAccountCharacterPack";
import { genshinEventEmitter } from "#server/services/genshin/events/genshinEventEmitter";
import { saveGenshin } from "#server/services/genshin/saveGenshin";
import { startGenshin } from "#server/services/genshin/startGenshin";
import { router } from "#server/trpc";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";

export const genshinRouter = router({
  generateCharacterPackUploadSasUrls: standardAuthedProcedure
    .input(generateCharacterPackUploadSasUrlsInputSchema)
    .mutation<CharacterPackUploadGrant[]>(({ ctx, input }) =>
      generateAccountCharacterPackUploadSasUrls(ctx.db, ctx.getSessionPayload.user.id, input),
    ),
  keepCharacterPack: standardAuthedProcedure
    .input(keepCharacterPackInputSchema)
    .mutation<void>(async ({ ctx, input }) => {
      await keepAccountCharacterPack(ctx.db, ctx.getSessionPayload.user.id, input);
    }),
  onSessionReplaced: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    const events = on(genshinEventEmitter, "replaceSession", { signal });
    for await (const [[targetUserId, sessionId]] of events) if (targetUserId === userId) yield sessionId;
  }),
  readCharacterPacks: standardAuthedProcedure.query<AccountCharacterPackRecord[]>(({ ctx }) =>
    readAccountCharacterPacks(ctx.getSessionPayload.user.id),
  ),
  removeCharacterPack: standardAuthedProcedure
    .input(removeCharacterPackInputSchema)
    .mutation<void>(async ({ ctx, input }) => {
      await removeAccountCharacterPack(ctx.getSessionPayload.user.id, input.characterId);
    }),
  saveGenshin: standardAuthedProcedure
    .input(saveGenshinInputSchema)
    .mutation<SaveGenshinResult>(({ ctx, input }) => saveGenshin(ctx.getSessionPayload.user.id, input)),
  startGenshin: standardAuthedProcedure
    .input(startGenshinInputSchema)
    .mutation<StartGenshinResult>(({ ctx, input }) => startGenshin(ctx.getSessionPayload.user.id, input.sessionId)),
});
