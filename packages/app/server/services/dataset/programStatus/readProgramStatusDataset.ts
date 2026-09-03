import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getUtcDateString } from "#shared/util/date/getUtcDateString";
import { readProgramParticipantEntitiesCount } from "@@/server/services/program/readProgramParticipantEntitiesCount";
import { readProgramStatusRows } from "@@/server/services/program/readProgramStatusRows";
import { requireOwnedResource } from "@@/server/services/resource/requireOwnedResource";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { ResourceType } from "@esposter/db-schema";
// A dataset flows into dashboards and a dashboard is publishable, so its snapshot is a public read.
// The participant column is therefore their non-secret publicId — never keyValue, which is the
// Participant list, and never the token, which is the bearer credential survey writes accept.
// Response-rate charting needs counts and dates, not identities
export const readProgramStatusDataset: DatasetProvider = async (ctx, reference) => {
  const resource = await requireOwnedResource(ctx, reference.id, ResourceType.Program);

  const { isRespondedPartial, rows: statusRows } = await readProgramStatusRows(resource.id);
  // A read that fit under the cap answers for itself; only a read that filled it pays for the count
  const totalRows =
    statusRows.length < AZURE_MAX_PAGE_SIZE
      ? statusRows.length
      : await readProgramParticipantEntitiesCount(resource.id);
  return {
    columns: [
      { name: "participant", type: ColumnType.String },
      { name: "addedAt", type: ColumnType.Date },
      { name: "responded", type: ColumnType.Boolean },
    ],
    // A capped response read reports unmatched participants as not responded, and every participant row is
    // Still present — so the funnel looks complete while under-reporting. The dataset says so rather than
    // Letting a dashboard or a published snapshot chart it as an exact total
    ...(isRespondedPartial && { partialColumns: ["responded"] }),
    // Charting a funnel needs the day, not the minute — and a date-only string is what survives the
    // Published-snapshot round trip (see getUtcDateString)
    rows: statusRows.map(({ addedAt, isResponded, publicId }) => ({
      addedAt: getUtcDateString(addedAt),
      participant: publicId,
      responded: isResponded,
    })),
    totalRows,
  };
};
