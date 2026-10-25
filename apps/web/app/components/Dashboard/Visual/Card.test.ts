// @vitest-environment nuxt
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import DashboardVisualCard from "@/components/Dashboard/Visual/Card.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("dashboardVisualCard", () => {
  const name = "Count of x";

  test("a card abbreviates a large number", async () => {
    expect.hasAssertions();

    const data: VisualPropsData = { series: [{ data: [12000], name }] };
    const wrapper = await mountSuspended(DashboardVisualCard, {
      props: { data, visual: new Visual({ type: VisualType.Card }) },
    });

    expect(wrapper.findAll("span").map((span) => span.text())).toStrictEqual(["12K", name]);
  });
});
