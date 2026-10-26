import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { DataExportStatus } from "@esposter/db-schema";

export const readActiveDataExport = (ctx: AuthedContext) =>
  ctx.db.query.dataExportsInUser.findFirst({
    where: {
      status: { in: [DataExportStatus.Building, DataExportStatus.Queued] },
      userId: { eq: ctx.getSessionPayload.user.id },
    },
  });
