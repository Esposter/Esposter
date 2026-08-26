import type { InviteInMessageWithCreator, RoomInMessage } from "@esposter/db-schema";

import { createHookRegistry } from "@/services/shared/createHookRegistry";

export type InviteCreateHook = (roomId: RoomInMessage["id"], invite: InviteInMessageWithCreator) => void;

// Fired by the invite store whenever a member mints a link, so a surface listing the room's whole set hears about
// One created anywhere else without the invite store having to import the store that lists them.
export const inviteCreateHooks = createHookRegistry<InviteCreateHook>();
