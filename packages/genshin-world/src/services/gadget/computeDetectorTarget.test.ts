import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { ChestKind } from "#src/models/chest/ChestKind";
import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { computeDetectorTarget } from "#src/services/gadget/computeDetectorTarget";
import { describe, expect, test } from "vitest";

const chest = (id: string, x: number, z: number): ChestPlace => ({ id, kind: ChestKind.Common, position: { x, z } });

const createGadget = (overrides: Partial<GadgetRow>): GadgetRow => ({
  cooldownGroup: 0,
  cooldownOnFailSeconds: 0,
  cooldownSeconds: 0,
  gatherItemId: 0,
  id: 1,
  isEquipable: true,
  kind: GadgetKind.Detector,
  maxCountByPlayer: 0,
  maxCountInScene: 0,
  maxPoints: 0,
  region: "",
  ...overrides,
});

describe(computeDetectorTarget, () => {
  const inside = chest("inside", 10, 10);
  const farther = chest("farther", 50, 50);
  const opened = chest("opened", 1, 1);
  const chestPlaces = [inside, farther, opened];
  const player = { x: 0, z: 0 };

  test("a compass points to the nearest box in its city", () => {
    expect.hasAssertions();

    const compass = createGadget({ region: "mondstadt" });

    expect(computeDetectorTarget(compass, chestPlaces, new Set([opened.id]), player)).toBe(inside);
    expect(computeDetectorTarget(compass, chestPlaces, new Set([inside.id, opened.id]), player)).toBe(farther);
  });

  test("a gadget that names no city, and a gadget that is not a detector, points to no box", () => {
    expect.hasAssertions();

    const seelieDetector = createGadget({ region: "" });
    const device = createGadget({ kind: GadgetKind.Device, region: "mondstadt" });

    expect(computeDetectorTarget(seelieDetector, chestPlaces, new Set(), player)).toBeUndefined();
    expect(computeDetectorTarget(device, chestPlaces, new Set(), player)).toBeUndefined();
  });
});
