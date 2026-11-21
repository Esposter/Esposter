import type { UpdateRoleInput } from "#shared/models/db/role/UpdateRoleInput";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomRoleTable } from "#src/services/message/role/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";
import { omitUndefined } from "@esposter/shared";

// The fields the write sets take their new values at once, and the rest of the role keeps the values it has
export const getUpdateRoomRoleEntry = ({ id, ...patch }: UpdateRoleInput): Entry =>
  getHeldRowEntry(roomRoleTable, [id], (roomRole) => ({ ...roomRole, ...omitUndefined(patch) }));
