import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";

import { escapeUntrustedCsvCell } from "@/services/resource/sheet/csv/escapeUntrustedCsvCell";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

const DELIMITER = ",";
// One row per participant: the key value the owner knows them by, and the survey link carrying their token.
// A key value comes from the audience dataset, which may be a survey's anonymous answers, so it is untrusted
export const createParticipantLinksCsv = (
  keyColumn: string,
  surveyId: string,
  participants: ProgramParticipant[],
  origin: string,
) => {
  const surveyUrl = `${origin}${RoutePath.View(ResourceType.Survey, surveyId)}`;
  const headerRow = [keyColumn, "Link"].map((header) => escapeUntrustedCsvCell(header, DELIMITER)).join(DELIMITER);
  const dataRows = participants.map(({ keyValue, token }) => {
    const link = `${surveyUrl}?${new URLSearchParams({ t: token })}`;
    return [escapeUntrustedCsvCell(keyValue, DELIMITER), escapeUntrustedCsvCell(link, DELIMITER)].join(DELIMITER);
  });
  return [headerRow, ...dataRows].join("\n");
};
