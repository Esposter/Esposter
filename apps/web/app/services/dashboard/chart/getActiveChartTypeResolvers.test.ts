import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { BasicResolver } from "@/models/resolvers/dashboard/chart/BasicResolver";
import { DonutResolver } from "@/models/resolvers/dashboard/chart/DonutResolver";
import { getActiveChartTypeResolvers } from "@/services/dashboard/chart/getActiveChartTypeResolvers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getActiveChartTypeResolvers, () => {
  test("resolves a basic chart through the base resolver alone", () => {
    expect.hasAssertions();

    const resolvers = getActiveChartTypeResolvers(ChartType.Basic);

    expect(resolvers).toHaveLength(1);
    expect(takeOne(resolvers)).toBeInstanceOf(BasicResolver);
  });

  test("layers the type's own resolver on top of the base one", () => {
    expect.hasAssertions();

    const resolvers = getActiveChartTypeResolvers(ChartType.Donut);

    expect(resolvers).toHaveLength(2);
    expect(takeOne(resolvers)).toBeInstanceOf(BasicResolver);
    expect(takeOne(resolvers, 1)).toBeInstanceOf(DonutResolver);
  });
});
