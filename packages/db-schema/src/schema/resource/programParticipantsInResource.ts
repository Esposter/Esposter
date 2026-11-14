import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { sqliteTable } from "#src/sqliteTable";
import { SECRET_TOKEN_HASH_LENGTH } from "@esposter/shared";
import { text, unique } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

// One row per person in a program's audience. The key value is the participant's identity, so the unique constraint on
// the program and the key is what refuses a second row for someone who already has one
export const programParticipantsInResource = sqliteTable(
  "programParticipants",
  {
    // The audience key column's value for this participant. Never leaves the server or the owner's client
    keyValue: text().notNull(),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    // A non-secret stand-in for the participant, safe to publish. The token is the bearer credential a survey write
    // accepts, so it can never be the identity a publishable dataset carries
    publicId: text().notNull(),
    resourceId: text()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
    // The SHA-256 of the credential in the participant's link, never the credential, which is shown once when it is issued.
    // A survey response names its participant by this hash, and a regeneration replaces it, so it is unique on its own
    tokenHash: text().notNull(),
  },
  {
    extraConfig: ({ keyValue, resourceId, tokenHash }) => [
      unique("programParticipants_resourceId_keyValue_unique").on(resourceId, keyValue),
      unique("programParticipants_tokenHash_unique").on(tokenHash),
    ],
    schema: resourceSchema,
  },
);

export type ProgramParticipantInResource = typeof programParticipantsInResource.$inferSelect;

export const selectProgramParticipantInResourceSchema = createSelectSchema(programParticipantsInResource, {
  id: () => z.uuidv7(),
  publicId: () => z.uuidv7(),
  resourceId: () => z.uuidv7(),
  tokenHash: () => z.hex().length(SECRET_TOKEN_HASH_LENGTH),
});
