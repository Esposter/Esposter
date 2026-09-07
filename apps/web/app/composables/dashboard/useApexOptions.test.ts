import type { ApexOptions } from "apexcharts";

import { Chart } from "#shared/models/dashboard/data/chart/Chart";
import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { describe, expect, test } from "vitest";

// A resolver that is no longer active never takes its own options back out, so an evaluation that layered them
// Into the initial options themselves would keep applying the type the visual no longer has
describe(useApexOptions, () => {
  const height = 100;
  // The one call site builds this from the visual's data and its measured height — neither of which changes
  // When the visual type or the chart type does, so it stays cached across those edits
  const createInitialOptions = () => computed<ApexOptions>(() => ({ chart: { height } }));

  test("drops the options of a visual type the visual no longer has", () => {
    expect.hasAssertions();

    const visualType = ref(VisualType.Funnel);
    const initialOptions = createInitialOptions();
    const options = useApexOptions(new Chart(), visualType, initialOptions);

    expect(options.value.plotOptions?.bar?.isFunnel).toBe(true);

    visualType.value = VisualType.Area;

    expect(options.value.plotOptions).toBeUndefined();
    expect(initialOptions.value).toStrictEqual({ chart: { height } });
  });

  test("drops the options of a chart type the chart no longer has", () => {
    expect.hasAssertions();

    const chart = ref(new Chart());
    chart.value.type = ChartType["3D"];
    const initialOptions = createInitialOptions();
    const options = useApexOptions(chart, VisualType.Bubble, initialOptions);

    expect(options.value.fill?.type).toBe("gradient");

    chart.value.type = ChartType.Basic;

    expect(options.value.fill).toBeUndefined();
    expect(initialOptions.value).toStrictEqual({ chart: { height } });
  });
});
