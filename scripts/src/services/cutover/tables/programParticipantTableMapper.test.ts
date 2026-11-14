import type { LegacyEntity } from "#src/models/cutover/LegacyEntity";
import type { TableParents } from "#src/models/cutover/TableParents";

import { POSTGRES_ID_MAP_SCOPE } from "#src/services/cutover/constants";
import { createIdMap } from "#src/services/cutover/tables/createIdMap";
import { programParticipantTableMapper } from "#src/services/cutover/tables/programParticipantTableMapper";
import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { describe, expect, test } from "vitest";

describe("programParticipantTableMapper", () => {
  const ARCHIVE_BUCKET = "cutover-archive";
  const RESOURCE_OLD_ID = "0196a2e4-1f3b-4c7d-8e9f-0a1b2c3d4e5f";
  const OLD_TOKEN = "0196a2e4-aaaa-4bbb-8ccc-dddddddddddd";
  const timestamp = new Date(0);
  const entity: LegacyEntity = {
    keyValue: "",
    partitionKey: RESOURCE_OLD_ID,
    publicId: "",
    rowKey: "",
    token: OLD_TOKEN,
  };

  // The archive in memory, which the id map reads and writes as its segments
  const createArchive = () => {
    const segments = new Map<string, string>();
    return {
      getText: async (_bucket: string, key: string) => segments.get(key),
      putText: async (_bucket: string, key: string, text: string) => {
        segments.set(key, text);
      },
    };
  };
  const createParents = (resourceId: string): TableParents => ({
    apiKeyIds: new Set(),
    appUserIds: new Set(),
    resourceIds: new Set([resourceId]),
    roomIds: new Set(),
    userIds: new Set(),
  });

  test("replaces an old token with the hash of a token nobody receives, so no readable credential reaches D1", async () => {
    expect.hasAssertions();

    const archive = createArchive();
    const idMap = await createIdMap(archive, ARCHIVE_BUCKET, [LegacyAzureTable.ProgramParticipants]);
    const { id: resourceId } = idMap.assignOldId(RESOURCE_OLD_ID, timestamp);
    const row = programParticipantTableMapper.map(entity, { idMap, parents: createParents(resourceId), timestamp });

    expect(row?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(row)).not.toContain(OLD_TOKEN);
  });

  test("gives a row the same hash on a re-run, so the copy writes the same row again", async () => {
    expect.hasAssertions();

    const archive = createArchive();
    const firstIdMap = await createIdMap(archive, ARCHIVE_BUCKET, [LegacyAzureTable.ProgramParticipants]);
    const { id: resourceId } = firstIdMap.assignOldId(RESOURCE_OLD_ID, timestamp);
    const firstRow = programParticipantTableMapper.map(entity, {
      idMap: firstIdMap,
      parents: createParents(resourceId),
      timestamp,
    });
    await firstIdMap.flush(POSTGRES_ID_MAP_SCOPE);
    await firstIdMap.flush(LegacyAzureTable.ProgramParticipants);

    const rerunIdMap = await createIdMap(archive, ARCHIVE_BUCKET, [LegacyAzureTable.ProgramParticipants]);
    const rerunRow = programParticipantTableMapper.map(entity, {
      idMap: rerunIdMap,
      parents: createParents(resourceId),
      timestamp,
    });

    expect(rerunRow).toStrictEqual(firstRow);
  });
});
