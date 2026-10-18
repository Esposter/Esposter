// @vitest-environment nuxt
import StyledApexChart from "@/components/Styled/ApexChart.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ApexCharts from "apexcharts";
import { afterEach, describe, expect, test, vi } from "vitest";

// The engine measures its SVG as it draws, which happy-dom cannot lay out, so its drawing is stubbed and what is under
// Test is when the component builds, updates and tears the engine down
describe(StyledApexChart, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("#45 emits load once the chart has rendered, and hands out its instance from then on", async () => {
    expect.hasAssertions();

    vi.spyOn(ApexCharts.prototype, "render").mockResolvedValue(this);
    const component = await mountSuspended(StyledApexChart, { props: { series: [] } });
    await flushPromises();

    expect(component.emitted("load")).toStrictEqual([[]]);
    expect(component.vm.getChart()).toBeInstanceOf(ApexCharts);
  });

  test("#129 rebuilds the chart when its options change the chart type", async () => {
    expect.hasAssertions();

    const render = vi.spyOn(ApexCharts.prototype, "render").mockResolvedValue(this);
    const destroy = vi.spyOn(ApexCharts.prototype, "destroy").mockReturnValue();
    const updateOptions = vi.spyOn(ApexCharts.prototype, "updateOptions").mockResolvedValue(this);
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
