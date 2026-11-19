import { ResourceTypeGetLinkTargetsMap } from "#server/services/resource/link/ResourceTypeGetLinkTargetsMap";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ResourceLinkType, ResourceType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { assert, describe, expect, test } from "vitest";

describe("resourceTypeGetLinkTargetsMap", () => {
  // A group's visuals are walked the way the dashboard's own are, so a dataset binding held inside a group is indexed
  test("reads a dataset binding held by a visual inside a group", () => {
    expect.hasAssertions();

    const getResourceLinkTargets = ResourceTypeGetLinkTargetsMap.get(ResourceType.Dashboard);
    assert.exists(getResourceLinkTargets);
    const targetId = v7();
    const dashboard = new Dashboard({
      visuals: [
        new Visual({
          type: VisualType.Group,
          visuals: [
            new Visual({
              dataset: {
                query: {
                  series: [{ aggregation: DatasetAggregationType.Count, column: "column" }],
                  xColumn: "xColumn",
                },
                reference: { id: targetId, type: DatasetProviderType.Sheet },
              },
            }),
          ],
        }),
      ],
    });

    expect(getResourceLinkTargets(dashboard)).toStrictEqual([{ targetId, type: ResourceLinkType.Dataset }]);
  });
});
