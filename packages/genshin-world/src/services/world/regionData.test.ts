import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { regionDataSchema } from "#src/models/world/RegionData";
import { JUMP_LANDMARK_KINDS } from "#src/services/map/constants";
import { jsonDateParse } from "@esposter/shared";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("region data", () => {
  const REGION_DIRECTORY = join(import.meta.dirname, "../../data/regions");

  test("every region file parses against its schema", async () => {
    expect.hasAssertions();

    const filenames = await readdir(REGION_DIRECTORY);
    const regionIds = await Promise.all(
      filenames.map(async (filename) => {
        const regionJson: unknown = jsonDateParse(await readFile(join(REGION_DIRECTORY, filename), "utf8"));
        return regionDataSchema.parse(regionJson).id;
      }),
    );

    expect(regionIds).toStrictEqual(filenames.map((filename) => filename.replace(/\.json$/u, "")));
  });

  test("a waypoint is listed as a jump target", async () => {
    expect.hasAssertions();

    const { landmarks } = regionDataSchema.parse(
      jsonDateParse(await readFile(join(REGION_DIRECTORY, "mondstadt.json"), "utf8")),
    );
    const jumpKinds = new Set(
      landmarks.filter(({ kind }) => JUMP_LANDMARK_KINDS.includes(kind)).map(({ kind }) => kind),
    );

    expect(jumpKinds.has(LandmarkKind.TeleportWaypoint)).toBe(true);
  });
});
