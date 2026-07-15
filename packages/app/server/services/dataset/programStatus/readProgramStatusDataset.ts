import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getUtcDateString } from "#shared/services/dayjs/getUtcDateString";
import { readProgramStatusRows } from "@@/server/services/program/readProgramStatusRows";
import { ResourceType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
// A dataset flows into dashboards and a dashboard is publishable, so its snapshot is a public read.
// The participant column is therefore their non-secret publicId — never keyValue, which is the
// Participant list, and never the token, which is the bearer credential survey writes accept.
// Response-rate charting needs counts and dates, not identities
export const readProgramStatusDataset: DatasetProvider = async (ctx, reference) => {
  const resource = await ctx.db.query.resources.findFirst({
    where: {
      // A program in the Recycle bin must not keep feeding live datasets
      deletedAt: { isNull: true },
      id: { eq: reference.id },
      type: { eq: ResourceType.Program },
      userId: { eq: ctx.getSessionPayload.user.id },
    },
  });
  if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });

  const statusRows = await readProgramStatusRows(resource.id);
  return {
    columns: [
      { name: "participant", type: ColumnType.String },
      { name: "addedAt", type: ColumnType.Date },
      { name: "responded", type: ColumnType.Boolean },
    ],
    // Charting a funnel needs the day, not the minute — and a date-only string is what survives the
    // Published-snapshot round trip (see getUtcDateString)
    rows: statusRows.map(({ addedAt, isResponded, publicId }) => ({
      addedAt: getUtcDateString(addedAt),
      participant: publicId,
      responded: isResponded,
    })),
  };
};
