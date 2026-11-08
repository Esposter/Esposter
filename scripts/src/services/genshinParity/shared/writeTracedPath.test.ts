import { traceInk } from "#src/services/genshinParity/shared/traceImage";
import { writeTracedPath } from "#src/services/genshinParity/shared/writeTracedPath";
import { InvalidOperationError } from "@esposter/shared";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(writeTracedPath, () => {
  // A ring on white, the inner detail a mark at scale 1 fills in and at scale 3 keeps
  const MARK_SIZE = 40;
  const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${MARK_SIZE}" height="${MARK_SIZE}"><circle cx="20" cy="20" r="12" fill="none" stroke="#000" stroke-width="4"/></svg>`;
  const SCALES = [1, 3];
  const MAP_SOURCE = "export const TracedMarkMap: Record<string, string> = {\n};\n";
  const MAX_EDGE_DIFFERENCE = 1;

  // The ink's box of a path drawn on the mark's own pixels, read from the rendered alpha so no path syntax is parsed here
  const readInkBox = async (path: string): Promise<number[]> => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MARK_SIZE}" height="${MARK_SIZE}" viewBox="0 0 ${MARK_SIZE} ${MARK_SIZE}"><path fill-rule="evenodd" d="${path}"/></svg>`;
    const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const inked = Array.from({ length: info.width * info.height }, (_value, pixel) => pixel).filter(
      (pixel) => (data[pixel * 4 + 3] ?? 0) > 127,
    );
    const xs = inked.map((pixel) => pixel % info.width);
    const ys = inked.map((pixel) => Math.floor(pixel / info.width));
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };

  let directory = "";
  let markPath = "";
  let mapPath = "";

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "traced-path-"));
    markPath = join(directory, "mark.png");
    mapPath = join(directory, "TracedMarks.ts");
    await sharp({ create: { background: "#fff", channels: 3, height: MARK_SIZE, width: MARK_SIZE } })
      .composite([{ input: Buffer.from(MARK_SVG) }])
      .png()
      .toFile(markPath);
    await writeFile(mapPath, MAP_SOURCE);
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("a mark traced at scale 1 and at scale 3 writes boxes within a reference pixel", async () => {
    expect.hasAssertions();

    for (const scale of SCALES) {
      const region = sharp(markPath)
        .flatten({ background: "#fff" })
        .extract({ height: MARK_SIZE, left: 0, top: 0, width: MARK_SIZE });
      // oxlint-disable-next-line no-await-in-loop -- Each write reads the map the one before it wrote, so the scales go in turn
      const { inkPaths } = await traceInk(region, MARK_SIZE, MARK_SIZE, scale, 0.5);
      // oxlint-disable-next-line no-await-in-loop -- Each write reads the map the one before it wrote, so the scales go in turn
      await writeTracedPath(mapPath, `Mark${scale}`, inkPaths.join(" "), scale);
    }

    const source = await readFile(mapPath, "utf8");
    const [atScale1, atScale3] = await Promise.all(
      SCALES.map((scale) => {
        const entry = new RegExp(`\\[Mark${scale}\\]:\\s*"([^"]+)"`, "u").exec(source)?.[1] ?? "";
        return readInkBox(entry);
      }),
    );
    for (const [edge, value] of (atScale1 ?? []).entries())
      expect(Math.abs(value - (atScale3?.[edge] ?? Infinity))).toBeLessThanOrEqual(MAX_EDGE_DIFFERENCE);
  });

  // The formatter lays a short record on one line, so the record is read back in whatever layout it was last given
  test("takes the next entry once the formatter has laid the map out on one line", async () => {
    expect.hasAssertions();

    const shortPath = join(directory, "Short.ts");
    await writeFile(shortPath, "export const Short: Record<string, string> = {\n};\n");

    await writeTracedPath(shortPath, "First", "m0 0h1v1z", 1);
    await writeTracedPath(shortPath, "Second", "m0 0h2v2z", 1);

    await expect(readFile(shortPath, "utf8")).resolves.toBe(
      'export const Short: Record<string, string> = { [First]: "m0 0h1v1z", [Second]: "m0 0h2v2z" };\n',
    );
  });

  test("refuses a record holding content other than its entries, and leaves the map as it was", async () => {
    expect.hasAssertions();

    const commentedPath = join(directory, "Commented.ts");
    const commentedSource =
      'export const Commented: Record<string, string> = {\n  // kept by hand\n  [First]: "m0 0h1v1z",\n};\n';
    await writeFile(commentedPath, commentedSource);

    await expect(writeTracedPath(commentedPath, "Second", "m0 0h2v2z", 1)).rejects.toMatchObject({
      name: InvalidOperationError.name,
    });
    await expect(readFile(commentedPath, "utf8")).resolves.toBe(commentedSource);
  });

  test("replaces the entry of a key it has already written", async () => {
    expect.hasAssertions();

    await writeTracedPath(mapPath, "Replaced", "m0 0h1v1z", 1);
    await writeTracedPath(mapPath, "Replaced", "m0 0h2v2z", 1);

    const source = await readFile(mapPath, "utf8");
    expect(source.match(/\[Replaced\]:/gu)).toHaveLength(1);
    expect(source).toContain('[Replaced]: "m0 0h2v2z",');
  });
});
