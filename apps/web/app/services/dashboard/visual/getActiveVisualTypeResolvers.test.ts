import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { ColumnResolver } from "@/models/resolvers/dashboard/visual/ColumnResolver";
import { TypeResolver } from "@/models/resolvers/dashboard/visual/TypeResolver";
import { getActiveVisualTypeResolvers } from "@/services/dashboard/visual/getActiveVisualTypeResolvers";
import { describe, expect, test } from "vitest";

describe(getActiveVisualTypeResolvers, () => {
  test("resolves a type apexcharts renders directly through the base resolver alone", () => {
    expect.hasAssertions();

    expect(getActiveVisualTypeResolvers(VisualType.Area).map(({ constructor }) => constructor)).toStrictEqual([
      TypeResolver,
    ]);
  });

  test("layers the type's own resolver on top of the base one", () => {
    expect.hasAssertions();

    expect(getActiveVisualTypeResolvers(VisualType.Column).map(({ constructor }) => constructor)).toStrictEqual([
      TypeResolver,
      ColumnResolver,
    ]);
  });
});
