import type { UserInAuth } from "@esposter/db-schema";

import { requireEntity } from "#server/trpc/guards/requireEntity";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";

export const storageRouter = router({
  // The owner's user row, whose total is stored and whose quota is derived from its tier on the client, so moving a
  // User to another tier changes what they see and what the gate enforces in the same instant. See
  // Openspec/specs/resource/storage-quotas/design.md
  readUsage: standardAuthedProcedure
    .meta({
      staticReason:
        "The user object pushes the owner's user row to their sockets as a typed event whenever the total changes",
    })
    .query<UserInAuth>(({ ctx }) => {
      const userId = ctx.user.id;
      return requireEntity(
        ctx.db.query.usersInAuth.findFirst({ where: { id: { eq: userId } } }),
        DatabaseEntityType.User,
        userId,
      );
    }),
});
