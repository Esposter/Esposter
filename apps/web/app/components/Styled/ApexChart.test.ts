// @vitest-environment nuxt
import StyledApexChart from "@/components/Styled/ApexChart.vue";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ApexCharts from "apexcharts";
import { afterEach, describe, expect, test, vi } from "vitest";

// The engine resolves a render or an update to the chart it ran on
const resolveToChart = function (this: ApexCharts) {
  return Promise.resolve(this);
};

// The engine measures its SVG as it draws, which happy-dom cannot lay out, so its drawing is stubbed and what is under
// Test is when the component builds, updates and tears the engine down
describe(StyledApexChart, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("#45 emits load once the chart has rendered, and hands out its instance from then on", async () => {
    expect.hasAssertions();

    const render = vi.spyOn(ApexCharts.prototype, "render").mockImplementation(resolveToChart);
    const component = await mountSuspended(StyledApexChart, { props: { series: [] } });
    await flushPromises();

    expect(component.emitted("load")).toStrictEqual([[]]);
    expect(component.vm.getChart()).toBe(takeOne(render.mock.contexts));
  });

  test("#129 rebuilds the chart when its options change the chart type", async () => {
    expect.hasAssertions();

    const render = vi.spyOn(ApexCharts.prototype, "render").mockImplementation(resolveToChart);
    const destroy = vi.spyOn(ApexCharts.prototype, "destroy").mockReturnValue();
    const updateOptions = vi.spyOn(ApexCharts.prototype, "updateOptions").mockImplementation(resolveToChart);
    const component = await mountSuspended(StyledApexChart, {
      props: { options: { chart: { type: "bar" } }, series: [] },
    });
    await flushPromises();
    await component.setProps({ options: { chart: { type: "line" } } });
    await flushPromises();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(2);
    expect(updateOptions).not.toHaveBeenCalled();
  });
});
