import type { InviteInMessageWithCreator, RoomInMessage } from "@esposter/db-schema";

import { createHookRegistry } from "@/services/shared/createHookRegistry";

export type InviteCreateHook = (roomId: RoomInMessage["id"], invite: InviteInMessageWithCreator) => void;

// Fired by the invite store whenever a member mints a link, so a surface listing the room's whole set hears
// About one created anywhere else without that store having to import it
export const inviteCreateHooks = createHookRegistry<InviteCreateHook>();
