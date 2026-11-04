import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MAX_VISUAL_GROUP_DEPTH } from "#shared/services/dashboard/constants";
import { createGroupChain } from "#shared/services/dashboard/createGroupChain.test";
import { toRawDeep } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// The messages the dashboard schema reports for a tree, read off a parse of its stored form
const readIssueMessages = (visuals: Visual[]) => {
  const result = dashboardSchema.safeParse(structuredClone(toRawDeep(new Dashboard({ visuals }))));
  return result.success ? [] : result.error.issues.map(({ message }) => message);
};

describe("dashboardSchema", () => {
  test("accepts a nested tree of groups up to the depth cap, with plain visuals in the deepest", () => {
    expect.hasAssertions();

    expect(readIssueMessages(createGroupChain(MAX_VISUAL_GROUP_DEPTH + 1))).toStrictEqual([]);
  });

  test("refuses a group nested past the depth cap", () => {
    expect.hasAssertions();

    expect(readIssueMessages(createGroupChain(MAX_VISUAL_GROUP_DEPTH + 2))).toStrictEqual([
      "A group nests deeper than the group depth allows",
    ]);
  });

  test("refuses a visual id held twice, across levels of the tree", () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    expect(
      readIssueMessages([new Visual({ id, type: VisualType.Group, visuals: [new Visual({ id })] })]),
    ).toStrictEqual(["Array items must be unique"]);
  });

  test("refuses a group with no visuals to hold", () => {
    expect.hasAssertions();

    expect(readIssueMessages([new Visual({ type: VisualType.Group })])).toStrictEqual([
      "A group must hold its visuals",
    ]);
  });

  test("refuses a visual of another type that holds visuals", () => {
    expect.hasAssertions();

    expect(readIssueMessages([new Visual({ type: VisualType.Bar, visuals: [] })])).toStrictEqual([
      "Only a group may hold visuals",
    ]);
  });

  test("refuses a group with a dataset binding", () => {
    expect.hasAssertions();

    const dataset = {
      query: { series: [{ aggregation: DatasetAggregationType.Count, column: "column" }], xColumn: "xColumn" },
      reference: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
    };

    expect(readIssueMessages([new Visual({ dataset, type: VisualType.Group, visuals: [] })])).toStrictEqual([
      "A group takes no dataset binding",
    ]);
  });
});
