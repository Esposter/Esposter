import { assertIsMember } from "#server/services/room/assertIsMember";
import { trackMemberRoomIds } from "#server/services/room/trackMemberRoomIds";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { roomIdsInputSchema } from "#shared/models/db/room/RoomIdsInput";

// A subscription over several rooms: the caller must be a member of every room the client listed, and the rooms it is
// Handed as `memberRoomIds` move with the caller's own joins and leaves for as long as the subscription lasts
export const getMemberRoomsProcedure = () =>
  standardAuthedProcedure.input(roomIdsInputSchema).use(async ({ ctx, input, next, signal }) => {
    await assertIsMember(ctx.db, ctx.getSessionPayload, input);
    const memberRoomIds = trackMemberRoomIds(input, { signal, userId: ctx.getSessionPayload.user.id });
    return next({ ctx: { memberRoomIds } });
  });
