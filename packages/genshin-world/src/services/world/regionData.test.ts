import type { RegionData } from "#src/models/world/RegionData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { DomainKind } from "#src/models/domains/DomainKind";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { checkIsJumpKind, REGION_LANDMARKS_SUFFIX, regionLandmarksSchema } from "#src/models/world/JumpLandmark";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { regionDataSchema } from "#src/models/world/RegionData";
import { readGameData } from "#src/services/data/readGameData";
import { readGameDataIndex } from "#src/services/data/readGameDataIndex";
import { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { jsonDateParse } from "@esposter/shared";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { z } from "zod";

const readEnemyKindIds = async (): Promise<Set<string>> =>
  new Set(Array.from((await readEnemyTables(GAME_DATA_LOCAL_BASE_URL)).enemyKindMap.keys(), String));

// The references no row of a published record holds, each with the place that names its id, so a failure names both
const findUnpublishedReferences = (
  references: readonly { id: string; source: string }[],
  publishedIds: ReadonlySet<string>,
): { id: string; source: string }[] => references.filter(({ id }) => !publishedIds.has(id));

describe("regionData", () => {
  const REGION_DIRECTORY = join(import.meta.dirname, "../../data/regions");

  test("every region file parses against its schema", async () => {
    expect.hasAssertions();

    // A region file's provenance sidecar sits beside it in the folder and is no region
    const filenames = (await readdir(REGION_DIRECTORY)).filter((filename) => /^[^.]+\.json$/u.test(filename));
    const regionIds = await Promise.all(
      filenames.map(async (filename) => {
        const regionJson: unknown = jsonDateParse(await readFile(join(REGION_DIRECTORY, filename), "utf8"));
        return regionDataSchema.parse(regionJson).id;
      }),
    );

    expect(regionIds).toStrictEqual(filenames.map((filename) => filename.replace(/\.json$/u, "")));
  });

  test("every region's landmarks file holds its jump landmarks, as its data file does", async () => {
    expect.hasAssertions();

    const filenames = (await readdir(REGION_DIRECTORY)).filter((filename) => /^[^.]+\.json$/u.test(filename));
    await Promise.all(
      filenames.map(async (filename) => {
        const { landmarks } = regionDataSchema.parse(
          jsonDateParse(await readFile(join(REGION_DIRECTORY, filename), "utf8")),
        );
        const landmarksFile = filename.replace(/\.json$/u, REGION_LANDMARKS_SUFFIX);
        const regionLandmarks = regionLandmarksSchema.parse(
          jsonDateParse(await readFile(join(REGION_DIRECTORY, landmarksFile), "utf8")),
        );

        expect(regionLandmarks.landmarks).toStrictEqual(landmarks.filter(({ kind }) => checkIsJumpKind(kind)));
      }),
    );
  });

  const readRegions = async (): Promise<RegionData[]> => {
    const filenames = (await readdir(REGION_DIRECTORY)).filter((filename) => /^[^.]+\.json$/u.test(filename));
    return Promise.all(
      filenames.map(async (filename) =>
        regionDataSchema.parse(jsonDateParse(await readFile(join(REGION_DIRECTORY, filename), "utf8"))),
      ),
    );
  };
  const PUBLISHED_REFERENCES = [
    {
      name: "camp member's kind",
      published: readEnemyKindIds,
      references: (regions: RegionData[]) =>
        regions.flatMap(({ enemyCamps }) =>
          enemyCamps.flatMap(({ id, members }) =>
            members.map(({ enemyKindId }) => ({ id: String(enemyKindId), source: id })),
          ),
        ),
    },
    {
      name: "EnemyKindId",
      published: readEnemyKindIds,
      references: () =>
        Object.entries(EnemyKindId).map(([name, id]) => ({ id: String(id), source: `EnemyKindId.${name}` })),
    },
    {
      name: "resident's game",
      published: async () =>
        new Set(
          Object.keys(await readGameData(GAME_DATA_LOCAL_BASE_URL, "gcg/games", z.record(z.string(), z.unknown()))),
        ),
      references: (regions: RegionData[]) =>
        regions.flatMap(({ residents }) =>
          residents.flatMap(({ duelGameId, id, weekGame }) =>
            [duelGameId, weekGame?.gameId].flatMap((gameId) =>
              gameId === undefined ? [] : [{ id: String(gameId), source: id }],
            ),
          ),
        ),
    },
    ...[
      {
        name: "domain entrance",
        published: async () => new Set(Object.keys(await readGameDataIndex(GAME_DATA_LOCAL_BASE_URL, "domains"))),
        trounce: false,
      },
      {
        name: "trounce entrance",
        published: async () => new Set(Object.keys(await readWeeklyBossDomains(GAME_DATA_LOCAL_BASE_URL))),
        trounce: true,
      },
    ].map(({ name, published, trounce }) => ({
      name,
      published,
      references: (regions: RegionData[]) =>
        regions.flatMap(({ landmarks }) =>
          landmarks.flatMap((landmark) =>
            landmark.kind === LandmarkKind.DomainEntrance && (landmark.domainKind === DomainKind.Trounce) === trounce
              ? [{ id: String(landmark.entryId), source: landmark.id }]
              : [],
          ),
        ),
    })),
  ];

  // Each id an authored region names, or the code's EnemyKindId, must be a row of the record its dataset pins. A record
  // Republished without one of them is named here, since no typecheck reads the record the lock points at
  test.each(PUBLISHED_REFERENCES)("every $name is published", async ({ published, references }) => {
    expect.hasAssertions();

    const regions = await readRegions();

    expect(findUnpublishedReferences(references(regions), await published())).toStrictEqual([]);
  });
});
