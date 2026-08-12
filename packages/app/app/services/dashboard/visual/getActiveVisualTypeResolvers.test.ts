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
});
