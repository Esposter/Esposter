import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { BasicResolver } from "@/models/resolvers/dashboard/chart/BasicResolver";
import { DonutResolver } from "@/models/resolvers/dashboard/chart/DonutResolver";
import { getActiveChartTypeResolvers } from "@/services/dashboard/chart/getActiveChartTypeResolvers";
import { describe, expect, test } from "vitest";

describe(getActiveChartTypeResolvers, () => {
  test("resolves a basic chart through the base resolver alone", () => {
    expect.hasAssertions();

    expect(getActiveChartTypeResolvers(ChartType.Basic).map(({ constructor }) => constructor)).toStrictEqual([
      BasicResolver,
    ]);
  });

  test("layers the type's own resolver on top of the base one", () => {
    expect.hasAssertions();

    expect(getActiveChartTypeResolvers(ChartType.Donut).map(({ constructor }) => constructor)).toStrictEqual([
      BasicResolver,
      DonutResolver,
    ]);
  });
});
