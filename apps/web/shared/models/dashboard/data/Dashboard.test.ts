import { dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { Visual, visualSchema } from "#shared/models/dashboard/data/Visual";
import { toRawDeep } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

// A stored dashboard is the blob's plain JSON, so its dates are the strings a save wrote
const createStoredDashboard = (fields: object = {}) => ({
  createdAt: new Date(0).toISOString(),
  id: crypto.randomUUID(),
  updatedAt: new Date(0).toISOString(),
  visuals: [],
  ...fields,
});

describe("dashboardSchema", () => {
  test("a dashboard saved before the layout settings reads with the defaults", () => {
    expect.hasAssertions();

    const dashboard = dashboardSchema.parse(createStoredDashboard());

    expect(dashboard.collision).toBe(CollisionMode.Push);
    expect(dashboard.compactType).toBe(CompactType.Vertical);
  });

  test("a layout setting outside its choices is refused", () => {
    expect.hasAssertions();

    const { success } = dashboardSchema.safeParse(createStoredDashboard({ collision: "Shove" }));

    expect(success).toBe(false);
  });

  test("a visual saved before fit height reads with it off", () => {
    expect.hasAssertions();

    const storedVisual = structuredClone(toRawDeep(new Visual()));
    Reflect.deleteProperty(storedVisual, "isAutoHeight");

    expect(visualSchema.parse(storedVisual).isAutoHeight).toBe(false);
  });
});
