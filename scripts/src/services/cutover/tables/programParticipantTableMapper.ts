import type { TableMapper } from "#src/models/cutover/TableMapper";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { requireReissuedTokenHash } from "#src/services/cutover/ids/requireReissuedTokenHash";
import { programParticipantsInResource } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// One person in a program's audience. Its row key is a hash of the key value, so the row carries no time of its own
const legacyProgramParticipantSchema = z.object({
  keyValue: z.string(),
  partitionKey: z.string(),
  publicId: z.string(),
  rowKey: z.string(),
  token: z.string(),
});

// The ProgramParticipants table: partitioned by the program's resource, and its time is the write's own timestamp.
// The token is the bearer credential a survey write accepts, so the row keeps only the hash of a token nobody receives: the owner regenerates the link after the cutover.
// A survey response that names the old token is written with that same hash
export const programParticipantTableMapper: TableMapper = {
  azureTable: LegacyAzureTable.ProgramParticipants,
  coreTable: getTableName(programParticipantsInResource),
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(programParticipantsInResource)}" GROUP BY "resourceId"`,
  toRow: (entity, { idMap, parents, timestamp }) => {
    const participant = legacyProgramParticipantSchema.parse(entity);
    const resourceId = idMap.rewrite(participant.partitionKey);
    if (!parents.resourceIds.has(resourceId)) return undefined;

    const createdAt = timestamp?.getTime() ?? Date.now();
    const { id } = idMap.assign(
      LegacyAzureTable.ProgramParticipants,
      participant.partitionKey,
      participant.rowKey,
      new Date(createdAt),
      participant.token,
    );
    return {
      createdAt,
      deletedAt: null,
      id,
      keyValue: participant.keyValue,
      publicId: participant.publicId,
      resourceId,
      tokenHash: requireReissuedTokenHash(idMap, participant.token, getTableName(programParticipantsInResource)),
      updatedAt: createdAt,
    };
  },
};
