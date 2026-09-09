import { TMXParsed } from "#src/models/tmx/parsed/TMXParsed";
import { parseTmx } from "#src/parseTmx";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { describe, expect, test } from "vitest";

describe(parseTmx, () => {
  const ROOT_DIRECTORY = join(import.meta.dirname, "..");
  const MAP_DIRECTORY = `${ROOT_DIRECTORY}/maps`;
  const name = "name";
  const value = "value";

  test("empty", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx("<map><data/></map>");

    expect(tmxParsed).toStrictEqual(new TMXParsed());
  });

  test("parses map properties", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx(`<map><properties><property name="${name}" value="${value}"/></properties></map>`);

    expect(tmxParsed.map.properties).toStrictEqual([{ name, value }]);
  });

  test("snapshots", { timeout: Temporal.Duration.from({ seconds: 60 }).total("milliseconds") }, async () => {
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
