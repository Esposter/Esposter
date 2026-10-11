import { TMXParsed } from "#src/models/tmx/parsed/TMXParsed";
import { parseTmx } from "#src/parseTmx";
import { jsonDateParse, noop } from "@esposter/shared";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { describe, expect, test } from "vitest";

const throwError = (error: Error): never => {
  throw error;
};

describe(parseTmx, () => {
  const ROOT_DIRECTORY = join(import.meta.dirname, "..");
  const MAP_DIRECTORY = `${ROOT_DIRECTORY}/maps`;
  const name = "name";
  const value = "value";

  test("empty", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx("<map><data/></map>");

    expect(tmxParsed.match((parsedTmx) => parsedTmx, throwError)).toStrictEqual(new TMXParsed());
  });

  test("parses map properties", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx(`<map><properties><property name="${name}" value="${value}"/></properties></map>`);

    expect(tmxParsed.match((parsedTmx) => parsedTmx.map.properties, throwError)).toStrictEqual([{ name, value }]);
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

        expect(tmxParsed.match((parsedTmx) => jsonDateParse(JSON.stringify(parsedTmx)), throwError)).toStrictEqual(
          jsonDateParse(snapshot),
        );
      }),
    );
  });

  // Issue #2 of tmx-map-parser, handle groups: a group's layers are read in document order, and a group within a group
  // Is read the same way
  test("parses a group's layers", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx(
      `<map width="2" height="2"><group id="1" name="group"><group id="2" name="inner"><layer id="3" name="layer" width="2" height="2"><data encoding="csv">0,1,2,3</data></layer></group></group></map>`,
    );

    expect(tmxParsed.match((parsedTmx) => parsedTmx.map.layers, throwError)).toStrictEqual([
      {
        id: 1,
        layers: [
          {
            id: 2,
            layers: [{ data: [0, 1, 2, 3], height: 2, id: 3, name: "layer", type: "layer", width: 2 }],
            name: "inner",
            type: "group",
          },
        ],
        name: "group",
        type: "group",
      },
    ]);
  });

  test("reads an infinite map's layer from its chunks", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx(
      `<map width="2" height="2" infinite="1"><layer id="1" name="layer" width="2" height="2"><data encoding="csv"><chunk x="0" y="0" width="2" height="1">0,1</chunk><chunk x="0" y="1" width="2" height="1">2,3</chunk></data></layer></map>`,
    );

    expect(tmxParsed.match((parsedTmx) => parsedTmx.map.layers, throwError)).toStrictEqual([
      {
        chunks: [
          { data: [0, 1], height: 1, width: 2, x: 0, y: 0 },
          { data: [2, 3], height: 1, width: 2, x: 0, y: 1 },
        ],
        height: 2,
        id: 1,
        name: "layer",
        type: "layer",
        width: 2,
      },
    ]);
  });

  test("reads an object's shape and its points", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx(
      `<map><objectgroup id="1" name="objects"><object id="2" x="0" y="0"><polyline points="0,0 1,0 1,1"/></object></objectgroup></map>`,
    );

    expect(tmxParsed.match((parsedTmx) => parsedTmx.map.layers, throwError)).toStrictEqual([
      {
        id: 1,
        name: "objects",
        objects: [
          {
            height: 0,
            id: 2,
            name: "",
            points: [
              [0, 0],
              [1, 0],
              [1, 1],
            ],
            shape: "polyline",
            type: "",
            width: 0,
            x: 0,
            y: 0,
          },
        ],
        type: "objectgroup",
      },
    ]);
  });

  test("translates each cell's flips when asked", async () => {
    expect.hasAssertions();

    const horizontallyFlippedGid = 0x80000001;
    const tmxParsed = await parseTmx(
      `<map width="1" height="1"><layer id="1" name="layer" width="1" height="1"><data encoding="csv">${horizontallyFlippedGid}</data></layer></map>`,
      true,
    );

    expect(tmxParsed.match((parsedTmx) => parsedTmx.map.layers, throwError)).toStrictEqual([
      {
        data: [1],
        flips: [{ Diagonal: false, Horizontal: true, Vertical: false }],
        height: 1,
        id: 1,
        name: "layer",
        type: "layer",
        width: 1,
      },
    ]);
  });

  test.each([
    ["base64 with no compression", undefined],
    ["base64 gzipped", "gzip"],
  ])("decodes %s tile data", async (_description, compression) => {
    expect.hasAssertions();

    const bytes = Buffer.alloc(4 * Uint32Array.BYTES_PER_ELEMENT);
    for (const [index, gid] of [1, 2, 3, 4].entries()) bytes.writeUInt32LE(gid, index * Uint32Array.BYTES_PER_ELEMENT);
    const encoded =
      compression === undefined
        ? bytes
        : Buffer.from(
            await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer(),
          );
    const tmxParsed = await parseTmx(
      `<map width="2" height="2"><layer id="1" name="layer" width="2" height="2"><data encoding="base64"${compression === undefined ? "" : ` compression="${compression}"`}>${encoded.toString("base64")}</data></layer></map>`,
    );

    expect(tmxParsed.match((parsedTmx) => parsedTmx.map.layers, throwError)).toStrictEqual([
      { data: [1, 2, 3, 4], height: 2, id: 1, name: "layer", type: "layer", width: 2 },
    ]);
  });

  test("refuses a document that is not well formed", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx("<map");

    tmxParsed.match(noop, (error) => {
      expect(() => {
        throw error;
      }).toThrowErrorMatchingInlineSnapshot(`
        [InvalidOperationError: Invalid operation: Read, name: readTmxDocument, Unexpected end
        Line: 0
        Column: 4
        Char: ]
      `);
    });
  });

  test("refuses a child of the map it does not model", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx("<map><unknown/></map>");

    tmxParsed.match(noop, (error) => {
      expect(() => {
        throw error;
      }).toThrowErrorMatchingInlineSnapshot(
        `[InvalidOperationError: Invalid operation: Read, name: openTmxMapChild, unknown is not a map child]`,
      );
    });
  });

  test("refuses a layer whose cells do not fill the map", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx(
      `<map width="2" height="2"><layer id="1" name="layer" width="2" height="2"><data encoding="csv">0,1</data></layer></map>`,
    );

    tmxParsed.match(noop, (error) => {
      expect(() => {
        throw error;
      }).toThrowErrorMatchingInlineSnapshot(
        `[InvalidOperationError: Invalid operation: Read, name: TMXLayer, expected 4 tiles, received 2]`,
      );
    });
  });

  test("refuses a compression it does not decode", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx(
      `<map width="1" height="1"><layer id="1" name="layer" width="1" height="1"><data encoding="base64" compression="zstd">AAAAAA==</data></layer></map>`,
    );

    tmxParsed.match(noop, (error) => {
      expect(() => {
        throw error;
      }).toThrowErrorMatchingInlineSnapshot(
        `[InvalidOperationError: Invalid operation: Read, name: parseCompression, zstd is not a supported compression]`,
      );
    });
  });
});
