import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { CreatableResourceTypes } from "@/services/resource/CreatableResourceTypes";
import { ResourceTypeDescriptionMap } from "@/services/resource/ResourceTypeDescriptionMap";
import { getServiceSearchItems } from "@/services/resource/search/getServiceSearchItems";
import { ResourceType } from "@esposter/db-schema";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getServiceSearchItems, () => {
  const surveyItem = {
    createTo: RoutePath.ResourceExplorerCreateType(ResourceType.Survey),
    group: ResourceSearchGroup.Services,
    icon: ResourceDefinitionMap[ResourceType.Survey].icon,
    id: `${ResourceSearchGroup.Services}${ID_SEPARATOR}${ResourceType.Survey}`,
    subtitle: ResourceTypeDescriptionMap[ResourceType.Survey],
    title: ResourceDefinitionMap[ResourceType.Survey].title,
    to: { path: RoutePath.ResourceExplorerAll, query: { types: ResourceType.Survey } },
  };

  test("returns every creatable type for an empty query", () => {
    expect.hasAssertions();
    expect(getServiceSearchItems("").map(({ title }) => title)).toStrictEqual(
      CreatableResourceTypes.map((type) => ResourceDefinitionMap[type].title),
    );
  });

  test("matches the type title case-insensitively", () => {
    expect.hasAssertions();
    expect(getServiceSearchItems(ResourceDefinitionMap[ResourceType.Survey].title.toUpperCase())).toStrictEqual([
      surveyItem,
    ]);
  });

  test("matches the type description", () => {
    expect.hasAssertions();
    expect(getServiceSearchItems(ResourceTypeDescriptionMap[ResourceType.Survey])).toStrictEqual([surveyItem]);
  });

  test("returns no items when nothing matches", () => {
    expect.hasAssertions();
    expect(getServiceSearchItems("-1")).toStrictEqual([]);
  });
});
