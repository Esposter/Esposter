import {
  checkIsJumpKind,
  JUMP_LANDMARK_KINDS,
  REGION_LANDMARKS_SUFFIX,
  regionLandmarksSchema,
} from "#src/models/world/JumpLandmark";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { regionDataSchema } from "#src/models/world/RegionData";
import { jsonDateParse } from "@esposter/shared";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

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
