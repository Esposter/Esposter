import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferenceEntryPlan } from "#src/models/genshinParity/reference/ReferenceEntryPlan";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { planReferencePack } from "#src/services/genshinParity/reference/planReferencePack";
import { describe, expect, test } from "vitest";

describe(planReferencePack, () => {
  const OURS = "1".repeat(64);
  const COMMITTED = "0".repeat(64);
  const SIZE = 1;
  const NO_OPTIONS = { replace: [], skipColliding: false };
  const SKIP_OPTIONS = { replace: [], skipColliding: true };
  const createRow = (id: string): ParityReferenceManifestRow => ({
    attribution: {},
    bytes: SIZE,
    capturedAt: new Date(0).toISOString(),
    height: SIZE,
    id,
    kind: ParityReferenceKind.Other,
    sha256: OURS,
    sourceFormat: "webp",
    width: SIZE,
  });
  const createPlan = (id: string, collisions: ReferenceCollision[] = [], isWritten = false): ReferenceEntryPlan => ({
    collisions,
    held: [],
    id,
    missing: [],
    objects: [],
    packed: [],
    row: isWritten ? createRow(id) : undefined,
  });
  const createCollision = (id: string): ReferenceCollision => ({ committed: COMMITTED, id, ours: OURS });

  test("stores every plan when nothing collides", () => {
    expect.hasAssertions();
    const plans = [createPlan("a"), createPlan("b")];
    expect(planReferencePack(plans, NO_OPTIONS)).toStrictEqual({
      blocked: [],
      replaced: [],
      skipped: [],
      stored: plans,
    });
  });

  test("blocks the run on a collision it was not told to skip or replace", () => {
    expect.hasAssertions();
    const plans = [createPlan("a", [createCollision("a")]), createPlan("b")];
    expect(planReferencePack(plans, NO_OPTIONS)).toStrictEqual({
      blocked: [createCollision("a")],
      replaced: [],
      skipped: [],
      stored: plans,
    });
  });

  test("leaves a colliding id out of what it stores when told to skip colliding ids, and lists it", () => {
    expect.hasAssertions();
    const plans = [createPlan("a", [createCollision("a")]), createPlan("b")];
    expect(planReferencePack(plans, SKIP_OPTIONS)).toStrictEqual({
      blocked: [],
      replaced: [],
      skipped: [createCollision("a")],
      stored: [plans[1]],
    });
  });

  test("replaces the rows of the ids it is told to, and still blocks a collision it is not told to replace", () => {
    expect.hasAssertions();
    const plans = [createPlan("a", [], true), createPlan("b", [createCollision("b")])];
    expect(planReferencePack(plans, { replace: ["a"], skipColliding: false })).toStrictEqual({
      blocked: [createCollision("b")],
      replaced: ["a"],
      skipped: [],
      stored: plans,
    });
  });

  test("refuses an id to replace that the map does not name", () => {
    expect.hasAssertions();
    expect(() =>
      planReferencePack([createPlan("a")], { replace: ["b"], skipColliding: false }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: b, is not a reference the map names with a screenshot, so it has no row to replace]`,
    );
  });

  test("refuses an id to replace that the map names with no screenshot", () => {
    expect.hasAssertions();
    const plans = [{ ...createPlan("a"), missing: ["a.webp"] }];
    expect(() => planReferencePack(plans, { replace: ["a"], skipColliding: false })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a, is not a reference the map names with a screenshot, so it has no row to replace]`,
    );
  });
});
