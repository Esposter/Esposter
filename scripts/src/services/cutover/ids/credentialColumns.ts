import {
  invitesInMessage,
  programParticipantsInResource,
  surveyResponsesInResource,
  webhooksInMessage,
} from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";

// A column that holds a bearer token, by table name. The token it held in Postgres is `oldColumn`.
// The column holds the hash of a token the copy gave it instead (`column`).
// A table that `issues` the token is the one whose rows get a fresh hash.
// A table that only names a token (a survey response names its participant's) takes the hash its participant was given
export interface TokenColumn {
  column: string;
  issues: boolean;
  oldColumn: string;
}

export const tableNameTokenColumnsMap: ReadonlyMap<string, TokenColumn[]> = new Map([
  [getTableName(programParticipantsInResource), [{ column: "tokenHash", issues: true, oldColumn: "token" }]],
  [
    getTableName(surveyResponsesInResource),
    [{ column: "participantTokenHash", issues: false, oldColumn: "participantToken" }],
  ],
  [getTableName(webhooksInMessage), [{ column: "tokenHash", issues: true, oldColumn: "token" }]],
]);

// The table whose primary key is an invite's code, which is re-issued rather than given a UUID
export const inviteTableName = getTableName(invitesInMessage);
