import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { escapeCsvCell } from "@/services/resource/sheet/csv/escapeCsvCell";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

// One row per participant: the key value the owner knows them by, and the survey link carrying their token.
// A key value comes from the audience dataset, which may be a survey's anonymous answers, so it is untrusted
export const createParticipantLinksCsv = (
  keyColumn: string,
  surveyId: string,
  participants: ProgramParticipant[],
  origin: string,
) => {
  const surveyUrl = `${origin}${RoutePath.View(ResourceType.Survey, surveyId)}`;
  const headerRow = [keyColumn, "Link"]
    .map((header) => escapeCsvCell(header, CsvDelimiter.Comma))
    .join(CsvDelimiter.Comma);
  const dataRows = participants.map(({ keyValue, token }) => {
    const link = `${surveyUrl}?${new URLSearchParams({ t: token })}`;
    return [keyValue, link].map((cell) => escapeCsvCell(cell, CsvDelimiter.Comma)).join(CsvDelimiter.Comma);
  });
  return [headerRow, ...dataRows].join("\n");
};
