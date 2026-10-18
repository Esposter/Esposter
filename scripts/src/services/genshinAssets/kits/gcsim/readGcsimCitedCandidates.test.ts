import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { readGcsimCitedCandidates } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedCandidates";
import { classifyKitValue } from "#src/services/genshinAssets/kits/record/classifyKitValue";
import { expandKitOverlay } from "genshin-world";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("readGcsimCitedCandidates", () => {
  const FOLDER = "aino";
  const ASC_GO = "package aino\n\nfunc tick() {\n\tadd(1.5 * 60)\n}\n";
  const AREA_GO =
    "package albedo\n\nfunc burst() {\n\tcombat.NewCircleHitOnTargetFanAngle(c.Core.Combat.Player(), nil, 8, 120)\n}\n";
  const QUEUE_GO =
    "package aino\n\nfunc burst() {\n\tc.Core.Tasks.Add(func() {\n\t\tc.Core.QueueAttack(ai, area, 70, 70)\n\t}, 75)\n}\n";
  const LOOP_GO = "package aino\n\nfunc blossoms() {\n\tfor i := range 3 {\n\t\tadd(10 + 5*i)\n\t}\n}\n";
  const MULTILINE_GO =
    "package aino\n\nfunc blossoms() {\n\tfor i := range 3 {\n\t\tc.Core.Queue(\n\t\t\t10+i*5,\n\t\t)\n\t}\n}\n";
  const createGcsimDirectory = () => {
    const directory = mkdtempSync(join(tmpdir(), "gcsim-cited-"));
    mkdirSync(join(directory, "internal", "characters", FOLDER), { recursive: true });
    writeFileSync(join(directory, "internal", "characters", FOLDER, "asc.go"), ASC_GO);
    writeFileSync(join(directory, "internal", "characters", FOLDER, "loop.go"), LOOP_GO);
    writeFileSync(join(directory, "internal", "characters", FOLDER, "area.go"), AREA_GO);
    writeFileSync(join(directory, "internal", "characters", FOLDER, "queue.go"), QUEUE_GO);
    writeFileSync(join(directory, "internal", "characters", FOLDER, "multiline.go"), MULTILINE_GO);
    return directory;
  };

  test("a cited line that evaluates to the value gives a Gcsim candidate with that file and line", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.waterBallInterval": { file: "asc.go", line: 4, source: KitSource.Gcsim, value: 90 },
    };
    const candidate = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get(
      "frames.waterBallInterval",
    )?.[0];
    expect(candidate?.value).toBe(90);
    expect(candidate?.provenance).toStrictEqual({
      file: "internal/characters/aino/asc.go",
      line: 4,
      source: KitSource.Gcsim,
    });
  });

  test("a cited line that does not give the value gives its first value, which compare names as DiffersFromSource", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.waterBallInterval": { file: "asc.go", line: 4, source: KitSource.Gcsim, value: 100 },
    };
    const candidates =
      readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("frames.waterBallInterval") ?? [];
    expect(candidates[0]?.value).toBe(90);
    expect(classifyKitValue(100, candidates, [], false, {})).toStrictEqual({
      cause: KitProvisionalCause.DiffersFromSource,
      value: 100,
    });
  });

  test("a cited line inside a loop whose array matches the loop's values gives that array as its candidate", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.blossomHitmarks": { file: "loop.go", line: 5, source: KitSource.Gcsim, value: [10, 15, 20] },
    };
    const candidate = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get(
      "frames.blossomHitmarks",
    )?.[0];
    expect(candidate?.value).toStrictEqual([10, 15, 20]);
    expect(candidate?.provenance).toStrictEqual({
      file: "internal/characters/aino/loop.go",
      line: 5,
      source: KitSource.Gcsim,
    });
  });

  test("a cited scalar inside a loop gives the loop's value equal to it, not the loop's array", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.blossomHitmark": { file: "loop.go", line: 5, source: KitSource.Gcsim, value: 15 },
    };
    const candidates = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("frames.blossomHitmark");
    expect(candidates?.[0]?.value).toBe(15);
    expect(classifyKitValue(15, candidates ?? [], [], false, {})).toBeUndefined();
  });

  test("a cited array the loop does not give reads as DiffersFromSource, with the loop's own array as the difference", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.blossomHitmarks": { file: "loop.go", line: 5, source: KitSource.Gcsim, value: [10, 15, 21] },
    };
    const candidates =
      readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("frames.blossomHitmarks") ?? [];
    expect(candidates[0]?.value).toStrictEqual([10, 15, 20]);
    expect(classifyKitValue([10, 15, 21], candidates, [], false, {})).toStrictEqual({
      cause: KitProvisionalCause.DiffersFromSource,
      value: [10, 15, 21],
    });
  });

  test("a cited area whose constructor's radius and fan angle equal the object's gives the cited area", () => {
    expect.hasAssertions();
    const angle = (120 * Math.PI) / 180;
    const overlay: KitOverlay = {
      "burst.hits.0.area": {
        file: "area.go",
        line: 4,
        source: KitSource.Gcsim,
        value: { angle, height: 2, radius: 8 },
      },
    };
    const candidate = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("burst.hits.0.area")?.[0];
    expect(candidate?.value).toStrictEqual({ angle, height: 2, radius: 8 });
    expect(candidate?.provenance).toStrictEqual({
      file: "internal/characters/aino/area.go",
      line: 4,
      source: KitSource.Gcsim,
    });
  });

  test("a cited area whose radius the constructor does not give reads as DiffersFromSource, with the constructor's area", () => {
    expect.hasAssertions();
    const angle = (120 * Math.PI) / 180;
    const overlay: KitOverlay = {
      "burst.hits.0.area": {
        file: "area.go",
        line: 4,
        source: KitSource.Gcsim,
        value: { angle, height: 2, radius: 9 },
      },
    };
    const candidates = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("burst.hits.0.area") ?? [];
    expect(candidates[0]?.value).toStrictEqual({ angle, height: 2, radius: 8 });
    expect(classifyKitValue({ angle, height: 2, radius: 9 }, candidates, [], false, {})).toStrictEqual({
      cause: KitProvisionalCause.DiffersFromSource,
      value: { angle, height: 2, radius: 9 },
    });
  });

  test("a cited line inside a queued block gives its value plus the block's delay", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "hits.burst.hitmarkFrames": { file: "queue.go", line: 5, source: KitSource.Gcsim, value: 145 },
    };
    const candidate = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get(
      "hits.burst.hitmarkFrames",
    )?.[0];
    expect(candidate?.value).toBe(145);
    expect(candidate?.provenance).toStrictEqual({
      file: "internal/characters/aino/queue.go",
      line: 5,
      source: KitSource.Gcsim,
    });
  });

  test("a cited hitmark the queued block does not give reads as DiffersFromSource, with the block's own hitmark", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "hits.burst.hitmarkFrames": { file: "queue.go", line: 5, source: KitSource.Gcsim, value: 150 },
    };
    const candidates =
      readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("hits.burst.hitmarkFrames") ?? [];
    expect(candidates[0]?.value).toBe(145);
    expect(classifyKitValue(150, candidates, [], false, {})).toStrictEqual({
      cause: KitProvisionalCause.DiffersFromSource,
      value: 150,
    });
  });

  test("a cited duration inside a queued block is cited as written, without the block's delay", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.burstDuration": { file: "queue.go", line: 5, source: KitSource.Gcsim, value: 70 },
    };
    expect(
      readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("frames.burstDuration")?.[0]?.value,
    ).toBe(70);
  });

  test("a cited run of hits matches the loop's element at each hit's index", () => {
    expect.hasAssertions();
    const overlay = expandKitOverlay<KitOverlayEntry>({
      "hits.blossom.0-2.poiseDamage": { file: "loop.go", line: 5, source: KitSource.Gcsim, value: [10, 15, 20] },
    });
    const candidates = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER);
    expect(candidates.get("hits.blossom.1.poiseDamage")?.[0]?.value).toBe(15);
    expect(candidates.get("hits.blossom.2.poiseDamage")?.[0]?.value).toBe(20);
  });

  test("a cited run of hits whose element a hit does not give reads as DiffersFromSource for that hit", () => {
    expect.hasAssertions();
    const overlay = expandKitOverlay<KitOverlayEntry>({
      "hits.blossom.0-2.poiseDamage": { file: "loop.go", line: 5, source: KitSource.Gcsim, value: [10, 15, 21] },
    });
    const candidates = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get(
      "hits.blossom.2.poiseDamage",
    );
    expect(classifyKitValue(21, candidates ?? [], [], false, {})).toStrictEqual({
      cause: KitProvisionalCause.DiffersFromSource,
      value: 21,
    });
  });

  test("a cited run of hits inside a loop's call spread over lines matches the loop's element at each hit's index", () => {
    expect.hasAssertions();
    const overlay = expandKitOverlay<KitOverlayEntry>({
      "hits.blossom.0-2.poiseDamage": { file: "multiline.go", line: 6, source: KitSource.Gcsim, value: [10, 15, 20] },
    });
    expect(
      readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("hits.blossom.1.poiseDamage")?.[0]?.value,
    ).toBe(15);
  });
});
