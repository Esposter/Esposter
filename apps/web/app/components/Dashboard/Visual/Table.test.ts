// @vitest-environment nuxt
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import DashboardVisualTable from "@/components/Dashboard/Visual/Table.vue";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("dashboardVisualTable", () => {
  const categories = ["a", "b"];
  const data: VisualPropsData = {
    options: { xaxis: { categories } },
    series: [
      { data: [1, 2], name: "x" },
      { data: [3, 4], name: "y" },
    ],
  };
  const visual = new Visual({
    dataset: {
      query: {
        series: [
          { aggregation: DatasetAggregationType.Count, column: "x" },
          { aggregation: DatasetAggregationType.Average, column: "y" },
        ],
        xColumn: "c",
      },
      reference: { id: "-1", type: DatasetProviderType.Sheet },
    },
    type: VisualType.Table,
  });

  test("a table lists each category as a row", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardVisualTable, { props: { data, visual } });
    expect(wrapper.findAll("tbody tr").map((row) => row.findAll("td").map((cell) => cell.text()))).toStrictEqual([
      ["a", "1", "3"],
      ["b", "2", "4"],
    ]);

    // A header's first press sorts its column ascending and its second descending, so the rows reverse on the second
    const countHeaderButton = takeOne(wrapper.findAll("th"), 1).find("button");
    await countHeaderButton.trigger("click");
    await countHeaderButton.trigger("click");
    expect(wrapper.findAll("tbody tr").map((row) => row.findAll("td").map((cell) => cell.text()))).toStrictEqual([
      ["b", "2", "4"],
      ["a", "1", "3"],
    ]);
  });

  test("a totals row leaves averages blank", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardVisualTable, { props: { data, visual } });

    expect(wrapper.findAll("tfoot td").map((cell) => cell.text())).toStrictEqual(["Total", "3", ""]);
  });
});
