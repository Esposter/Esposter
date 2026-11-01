import type { ElementalSight } from "#src/models/sight/ElementalSight";

import { describe } from "vitest";

export const createSight = (spreadSeconds: number): ElementalSight => ({
  isOn: true,
  origin: { x: 0, z: 0 },
  spreadSeconds,
});

describe.todo("createSight");
