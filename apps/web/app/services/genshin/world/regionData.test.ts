import { regionDataSchema } from "@/models/genshin/world/RegionData";
import { jsonDateParse } from "@esposter/shared";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("region data", () => {
  const REGION_DIRECTORY = join(import.meta.dirname, "../../../../public/genshin");

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
});
