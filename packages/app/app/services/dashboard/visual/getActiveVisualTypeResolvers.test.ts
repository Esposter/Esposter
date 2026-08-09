import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { ColumnResolver } from "@/models/resolvers/dashboard/visual/ColumnResolver";
import { TypeResolver } from "@/models/resolvers/dashboard/visual/TypeResolver";
import { getActiveVisualTypeResolvers } from "@/services/dashboard/visual/getActiveVisualTypeResolvers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getActiveVisualTypeResolvers, () => {
  test("resolves a type apexcharts renders directly through the base resolver alone", () => {
    expect.hasAssertions();

    const resolvers = getActiveVisualTypeResolvers(VisualType.Area);

    expect(resolvers).toHaveLength(1);
    expect(takeOne(resolvers)).toBeInstanceOf(TypeResolver);
  });

  test("layers the type's own resolver on top of the base one", () => {
    expect.hasAssertions();

    const resolvers = getActiveVisualTypeResolvers(VisualType.Column);

    expect(resolvers).toHaveLength(2);
    expect(takeOne(resolvers)).toBeInstanceOf(TypeResolver);
    expect(takeOne(resolvers, 1)).toBeInstanceOf(ColumnResolver);
  });

  // A resolver is stateless, so it is built once at module scope — every lookup hands back the same instance
  test("hands back the same instance on every call", () => {
    expect.hasAssertions();

    expect(takeOne(getActiveVisualTypeResolvers(VisualType.Column), 1)).toBe(
      takeOne(getActiveVisualTypeResolvers(VisualType.Column), 1),
    );
  });
});
