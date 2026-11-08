import { createStamp } from "#src/services/gameVersion/createStamp.test";
import { planStaleRows } from "#src/services/gameVersion/planStaleRows";
import { readStaleRows } from "#src/services/gameVersion/readStaleRows";
import { PROVENANCE_NAME } from "#src/services/provenance/constants";
import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(planStaleRows, () => {
  const INSTALL_VERSION = "7.1.0";
  const OLD_VERSION = "7.0.0";
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "planStaleRows-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("a command that stamped many outputs is planned once", async () => {
    expect.hasAssertions();

    for (const file of ["gi_map.bin", "gi_map.json", "index.tsv"])
      writeFileSync(getSidecarPath(join(directory, file)), JSON.stringify(createStamp("map", OLD_VERSION)));

    const rows = await readStaleRows(INSTALL_VERSION, [directory], []);

    expect(planStaleRows(rows)).toStrictEqual([{ commands: ["map"], heading: "Map" }]);
  });

  test("an extraction is planned before the fit that reads it", async () => {
    expect.hasAssertions();

    const extractedDirectory = join(directory, "extracted");
    const worldDirectory = join(directory, "world");
    mkdirSync(join(extractedDirectory, "windrise"), { recursive: true });
    mkdirSync(worldDirectory);
    writeFileSync(
      join(extractedDirectory, "windrise", PROVENANCE_NAME),
      JSON.stringify(createStamp("extract windrise", OLD_VERSION)),
    );
    writeFileSync(
      getSidecarPath(join(worldDirectory, "windrise.json")),
      JSON.stringify(createStamp("record windrise.json", OLD_VERSION)),
    );

    const rows = await readStaleRows(INSTALL_VERSION, [worldDirectory, extractedDirectory], []);

    expect(planStaleRows(rows)).toStrictEqual([
      { commands: ["extract windrise"], heading: "Extractions" },
      { commands: ["record windrise.json"], heading: "Fits" },
    ]);
  });

  test("a command no kind lists is planned last under its own heading", async () => {
    expect.hasAssertions();

    const folder = join(directory, "windrise");
    mkdirSync(folder);
    writeFileSync(join(folder, PROVENANCE_NAME), JSON.stringify(createStamp("extract windrise", OLD_VERSION)));
    writeFileSync(getSidecarPath(join(directory, "new.json")), JSON.stringify(createStamp("new-command", OLD_VERSION)));

    const rows = await readStaleRows(INSTALL_VERSION, [directory], []);

    expect(planStaleRows(rows)).toStrictEqual([
      { commands: ["extract windrise"], heading: "Extractions" },
      { commands: ["new-command"], heading: "Commands no kind lists" },
    ]);
  });
});
