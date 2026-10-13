import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";
import type { ProgramInvites } from "#shared/models/resource/program/ProgramInvites";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ResourceInResource } from "@esposter/db-schema";

import { getDanglingProgramBindingError } from "#server/services/program/getDanglingProgramBindingError";
import { readProgramAudienceDataset } from "#server/services/program/readProgramAudienceDataset";
import { readProgramParticipantEntities } from "#server/services/program/readProgramParticipantEntities";
import { readProgramStatusRows } from "#server/services/program/readProgramStatusRows";
import { readOwnedResource } from "#server/services/resource/readOwnedResource";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";
import { Operation, RoutePath } from "@esposter/shared";

// The invite export's read: the bound email as compiled, and one tokened invite per participant the scope selects.
// Owner-only, and the one read that carries tokens outside the mutation that issues them — both reach the owner alone
export const readProgramInvites = async (
  ctx: AuthedContext,
  program: ResourceInResource,
  scope: ProgramInviteScope,
): Promise<ProgramInvites> => {
  const content = await readResourceContent(programResourceSchema, program.id);
  if (!content?.audience || !content.emailId || !content.keyColumn || !content.surveyId)
    throw getDanglingProgramBindingError();
  const { audience, emailId, keyColumn, surveyId } = content;
  const [email, emailContent, survey] = await Promise.all([
    readOwnedResource(ctx, emailId, ResourceType.Email),
    readResourceContent(emailEditorSchema, emailId),
    readOwnedResource(ctx, surveyId, ResourceType.Survey),
  ]);
  if (!email || !survey) throw getDanglingProgramBindingError();
  // An invite whose button points nowhere would send every participant to a survey they cannot answer, so the
  // Email is refused before the audience or the participants are read
  const surveyPath = RoutePath.View(ResourceType.Survey, surveyId);
  if (!emailContent?.html?.includes(surveyPath))
    throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Resource, "the email has no link to the survey");
  const [audienceDataset, participants, statusRows] = await Promise.all([
    readProgramAudienceDataset(ctx, audience),
    readProgramParticipantEntities(program.id),
    readProgramStatusRows(ctx.db, program),
  ]);
  const respondedKeyValues = new Set(
    statusRows.rows.filter(({ isResponded }) => isResponded).map(({ keyValue }) => keyValue),
  );
  const rowKeyValueMap = new Map<string, Record<string, ColumnValue>>();
  for (const row of audienceDataset.rows) {
    const keyValue = row[keyColumn];
    if (typeof keyValue === "string" && keyValue && !rowKeyValueMap.has(keyValue)) rowKeyValueMap.set(keyValue, row);
  }
  const invites: ProgramInvite[] = [];
  let unmatchedCount = 0;
  for (const { keyValue, token } of participants) {
    if (scope === ProgramInviteScope.Awaiting && respondedKeyValues.has(keyValue)) continue;
    const row = rowKeyValueMap.get(keyValue);
    if (row) invites.push({ keyValue, row, token });
    else unmatchedCount++;
  }
  return { emailHtml: emailContent.html, invites, unmatchedCount };
};
