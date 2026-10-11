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

  // The corpus is one map per distinguishable shape: every element, attribute and structural value the maps
  // Reach between them, plus a map with no object layer and one whose object layer holds no object. A map
  // Repeating a shape already here re-parses the same branches for megabytes of committed snapshot, so it
  // Does not join — coverage is what earns a map a place, never realism
  // Each snapshot is the output of the parser this package shipped first, compared by deep equality, so a parser
  // That builds the same value in another key order still matches
  test("snapshots", async () => {
    expect.hasAssertions();

    const filenames = await readdir(MAP_DIRECTORY, { recursive: true });

    await Promise.all(
      filenames.map(async (filename) => {
        if (extname(filename).toLowerCase() !== ".tmx") return;

        const file = await readFile(`${MAP_DIRECTORY}/${filename}`, "utf8");
        const tmxParsed = await parseTmx(file);
        const snapshot = await readFile(`${MAP_DIRECTORY}/${filename}.snapshot.json`, "utf8");

        expect(JSON.parse(JSON.stringify(tmxParsed))).toStrictEqual(JSON.parse(snapshot));
      }),
    );
  });
});
