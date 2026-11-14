import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";
import type { ProgramInvites } from "#shared/models/resource/program/ProgramInvites";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ResourceInResource } from "@esposter/db-schema";

import { compileEmailContent } from "#server/services/emailEditor/compileEmailContent";
import { getDanglingProgramBindingError } from "#server/services/program/getDanglingProgramBindingError";
import { readProgramAudienceDataset } from "#server/services/program/readProgramAudienceDataset";
import { readProgramParticipantEntities } from "#server/services/program/readProgramParticipantEntities";
import { readProgramStatusRows } from "#server/services/program/readProgramStatusRows";
import { regenerateProgramParticipantTokens } from "#server/services/program/regenerateProgramParticipantTokens";
import { readOwnedResource } from "#server/services/resource/readOwnedResource";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";
import { Operation, RoutePath } from "@esposter/shared";

// The invite export: the bound email as compiled, and one invite per participant the scope selects, each issued a new
// link. A link cannot be read back once issued, so the export issues the links it carries, and the links already sent
// to those participants stop working. Owner-only, and the one answer that carries links, which reaches the owner alone
export const issueProgramInvites = async (
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
  if (!email || !emailContent || !survey) throw getDanglingProgramBindingError();
  // The email as the server compiles it from its stored working copy, the same compile the publish and the personalised
  // Export run, since no working copy holds html of its own
  const emailHtml = (await compileEmailContent(emailContent)).match(
    (html) => html,
    (error) => {
      throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Resource, error.message);
    },
  );
  // An invite whose button points nowhere would send every participant to a survey they cannot answer, so the
  // Email is refused before the audience or the participants are read
  const surveyPath = RoutePath.View(ResourceType.Survey, surveyId);
  if (!emailHtml.includes(surveyPath))
    throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Resource, "the email has no link to the survey");
  const [audienceDataset, participants, statusRows] = await Promise.all([
    readProgramAudienceDataset(ctx, audience),
    readProgramParticipantEntities(ctx.db, program.id),
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
  const scopedParticipants = participants.filter(
    ({ keyValue }) => scope !== ProgramInviteScope.Awaiting || !respondedKeyValues.has(keyValue),
  );
  const issuedTokenMap = new Map(
    (
      await regenerateProgramParticipantTokens(
        ctx.db,
        scopedParticipants.filter(({ keyValue }) => rowKeyValueMap.has(keyValue)),
      )
    ).map(({ id, token }) => [id, token]),
  );
  const invites: ProgramInvite[] = [];
  for (const { id, keyValue } of scopedParticipants) {
    const row = rowKeyValueMap.get(keyValue);
    const token = issuedTokenMap.get(id);
    if (row && token) invites.push({ keyValue, row, token });
  }
  return { emailHtml, invites, unmatchedCount: scopedParticipants.length - invites.length };
};
