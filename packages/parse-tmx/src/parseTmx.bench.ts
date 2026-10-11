import { Flipped } from "#src/models/Flipped";
import { parseTmx } from "#src/parseTmx";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, test } from "vitest";

// The largest committed map, read as the parser's real input
const LARGEST_FIXTURE_FILENAME = "noObjectLayer.tmx";
// A CSV layer of 300 by 300 cells, each a tile gid with every fifth one flipped horizontally
const CSV_MAP_SIZE = 300;
const FLIPPED_EVERY = 5;
// A fixture parse is a fraction of a millisecond, so it takes many more samples than the CSV map to settle
const FIXTURE_ITERATIONS = 200;
const CSV_ITERATIONS = 40;
const TILE_COUNT_MODULO = 13;

const createCsvMap = (size: number): string => {
  const cells = Array.from({ length: size * size }, (_value, index) =>
    index % FLIPPED_EVERY === 0
      ? (index % TILE_COUNT_MODULO) + 1 + Flipped.Horizontally
      : (index % TILE_COUNT_MODULO) + 1,
  );
  return `<map width="${size}" height="${size}"><layer id="1" name="layer" width="${size}" height="${size}"><data encoding="csv">${cells.join(",")}</data></layer></map>`;
};

describe(parseTmx, () => {
  const MAP_DIRECTORY = join(import.meta.dirname, "..", "maps");

  test("the largest fixture", async ({ bench }) => {
    const xml = await readFile(join(MAP_DIRECTORY, LARGEST_FIXTURE_FILENAME), "utf8");
    await bench.compare(
      bench("raw gids", async () => {
        await parseTmx(xml);
      }),
      bench("translated flips", async () => {
        await parseTmx(xml, true);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: FIXTURE_ITERATIONS },
    );
  });

  test("a 300x300 CSV map", async ({ bench }) => {
    const xml = createCsvMap(CSV_MAP_SIZE);
    await bench.compare(
      bench("raw gids", async () => {
        await parseTmx(xml);
      }),
      bench("translated flips", async () => {
        await parseTmx(xml, true);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: CSV_ITERATIONS },
    );
  });
});
