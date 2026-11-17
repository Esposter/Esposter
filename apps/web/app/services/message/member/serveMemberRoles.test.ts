import type { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { describe } from "vitest";

// The server's answer to a read of one member's roles: the rows the procedure returns, each carrying its role
export const serveMemberRoles = (
  trpcMsw: ReturnType<typeof setupMswTrpc>["trpcMsw"],
  roomId: string,
  userId: string,
  memberRoles: RoomRoleInMessage[],
) => {
  trpcMsw.role.readMemberRoles.query(() =>
    memberRoles.map((memberRole) => ({
      createdAt: memberRole.createdAt,
      deletedAt: memberRole.deletedAt,
      role: memberRole,
      roleId: memberRole.id,
      roomId,
      updatedAt: memberRole.updatedAt,
      userId,
    })),
  );
};

describe.todo("serveMemberRoles");
