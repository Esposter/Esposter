import type { UpsertMemberPermissionOverrideInput } from "#shared/models/db/role/UpsertMemberPermissionOverrideInput";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { mergeMemberPermissionOverride } from "#shared/services/room/rbac/mergeMemberPermissionOverride";
import { roomMemberPermissionTable } from "#src/services/message/role/constants";
import { getRoomMemberPermissionRowKey } from "#src/services/message/role/getRoomMemberPermissionRowKey";
import { NO_ROW_VERSION } from "@esposter/db-schema";

// The override is merged onto the one the member has now, a tombstone counting as none. An override that merges to nothing
// Leaves the member's roles alone, so its row is tombstoned rather than kept as an empty entry, as the server does
export const getUpsertMemberPermissionOverrideEntry =
  (input: UpsertMemberPermissionOverrideInput, now: Date): Entry =>
  (view) => {
    const key = getRoomMemberPermissionRowKey(input.userId, input.roomId);
    const held = view.get(roomMemberPermissionTable, key);
    const previous = held && !held.deletedAt ? { allow: held.allow, deny: held.deny } : { allow: 0n, deny: 0n };
    const override = mergeMemberPermissionOverride(previous, input);
    if (!(override.allow | override.deny)) {
      if (held) view.set(roomMemberPermissionTable, key, { ...held, deletedAt: now });
      return;
    }

    view.set(roomMemberPermissionTable, key, {
      allow: override.allow,
      createdAt: held?.createdAt ?? now,
      deletedAt: null,
      deny: override.deny,
      roomId: input.roomId,
      updatedAt: now,
      userId: input.userId,
      version: NO_ROW_VERSION,
    });
  };
