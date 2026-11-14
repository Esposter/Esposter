import type { TableMapper } from "#src/models/cutover/TableMapper";

import { programParticipantsInResource, StreamTable } from "@esposter/db-schema";
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

// The ProgramParticipants table: partitioned by the program's resource, and its time is the write's own timestamp
export const programParticipantTableMapper: TableMapper = {
  azureTable: StreamTable.ProgramParticipants,
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(programParticipantsInResource)}" GROUP BY "resourceId"`,
  coreTable: getTableName(programParticipantsInResource),
  map: (entity, { idMap, parents, timestamp }) => {
    const participant = legacyProgramParticipantSchema.parse(entity);
    if (!parents.resourceIds.has(participant.partitionKey)) return undefined;
    const createdAt = timestamp?.getTime() ?? Date.now();
    return {
      createdAt,
      deletedAt: null,
      id: idMap.assign(StreamTable.ProgramParticipants, participant.partitionKey, participant.rowKey),
      keyValue: participant.keyValue,
      publicId: participant.publicId,
      resourceId: participant.partitionKey,
      token: participant.token,
      updatedAt: createdAt,
    };
  },
};
