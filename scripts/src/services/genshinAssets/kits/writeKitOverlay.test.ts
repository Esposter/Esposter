import { writeKitOverlay } from "#src/services/genshinAssets/kits/writeKitOverlay";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe("writeKitOverlay", () => {
  let directory = "";

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "kit-overlay-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("writes an empty overlay as `{}` so the kit keeps its file", () => {
    expect.hasAssertions();

    const overlayPath = join(directory, "nicole.json");
    writeKitOverlay(overlayPath, {});

    expect(JSON.parse(readFileSync(overlayPath, "utf8"))).toStrictEqual({});
  });
});
