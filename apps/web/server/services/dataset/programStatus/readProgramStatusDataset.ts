import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getUtcDateString } from "#shared/util/date/getUtcDateString";
import { ProgramStatusDatasetColumnName } from "@@/server/models/dataset/programStatus/ProgramStatusDatasetColumnName";
import { readProgramParticipantEntitiesCount } from "@@/server/services/program/readProgramParticipantEntitiesCount";
import { readProgramStatusRows } from "@@/server/services/program/readProgramStatusRows";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";

// A dataset flows into dashboards and a dashboard is publishable, so its snapshot is a public read.
// The participant column is therefore their non-secret publicId — never keyValue, which is the
// Participant list, and never the token, which is the bearer credential survey writes accept.
// Response-rate charting needs counts and dates, not identities
export const readProgramStatusDataset: DatasetProvider["read"] = async ({ id }) => {
  const { isRespondedPartial, rows: statusRows } = await readProgramStatusRows(id);
  // A read that fit under the cap answers for itself; only a read that filled it pays for the count
  const totalRows =
    statusRows.length < AZURE_MAX_PAGE_SIZE ? statusRows.length : await readProgramParticipantEntitiesCount(id);
  return {
    columns: [
      { name: ProgramStatusDatasetColumnName.Participant, type: ColumnType.String },
      { name: ProgramStatusDatasetColumnName.AddedAt, type: ColumnType.Date },
      { name: ProgramStatusDatasetColumnName.Responded, type: ColumnType.Boolean },
    ],
    // A capped response read reports unmatched participants as not responded, and every participant row is
    // Still present — so the funnel looks complete while under-reporting. The dataset says so rather than
    // Letting a dashboard or a published snapshot chart it as an exact total
    ...(isRespondedPartial && { partialColumns: [ProgramStatusDatasetColumnName.Responded] }),
    // Charting a funnel needs the day, not the minute — and a date-only string is what survives the
    // Published-snapshot round trip (see getUtcDateString)
    rows: statusRows.map(({ addedAt, isResponded, publicId }) => ({
      [ProgramStatusDatasetColumnName.AddedAt]: getUtcDateString(addedAt),
      [ProgramStatusDatasetColumnName.Participant]: publicId,
      [ProgramStatusDatasetColumnName.Responded]: isResponded,
    })),
    totalRows,
  };
};
