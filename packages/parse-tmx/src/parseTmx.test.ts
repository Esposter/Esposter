import { TMXParsed } from "@/models/tmx/parsed/TMXParsed";
import { parseTmx } from "@/parseTmx";
import { dayjs } from "@/services/dayjs.test";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { describe, expect, test } from "vitest";

const ROOT_DIRECTORY = join(__dirname, "..");
const MAP_DIRECTORY = `${ROOT_DIRECTORY}/maps`;

describe(parseTmx, () => {
  test("empty", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx("<map><data/></map>");

    expect(tmxParsed).toStrictEqual(new TMXParsed());
  });

  test("snapshots", { timeout: dayjs.duration(20, "seconds").asMilliseconds() }, async () => {
    expect.hasAssertions();

    const filenames = await readdir(MAP_DIRECTORY, { recursive: true });

    await Promise.all(
      filenames.map(async (filename) => {
        if (extname(filename).toLowerCase() !== ".tmx") return;

        const file = await readFile(`${MAP_DIRECTORY}/${filename}`, "utf8");
        const tmxParsed = await parseTmx(file);

        await expect(JSON.stringify(tmxParsed)).toMatchFileSnapshot(`${ROOT_DIRECTORY}/__snapshots__/${filename}.json`);
      }),
    );
  });
});
