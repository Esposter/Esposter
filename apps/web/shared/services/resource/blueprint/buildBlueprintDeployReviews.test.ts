import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { buildBlueprintDeployReviews } from "#shared/services/resource/blueprint/buildBlueprintDeployReviews";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(buildBlueprintDeployReviews, () => {
  const parameterValues = { a: "b" };

  test("resolves the name an entry is created with from the parameter values", () => {
    expect.hasAssertions();

    const entries: BlueprintEntry[] = [{ key: "sheet", name: "{{parameter:a}} wave", type: ResourceType.Sheet }];

    expect(buildBlueprintDeployReviews(entries, parameterValues)).toStrictEqual([
      {
        description: "",
        icon: ResourceDefinitionMap[ResourceType.Sheet].icon,
        isNameEmpty: false,
        key: "sheet",
        title: "b wave",
      },
    ]);
  });

  test("marks a token naming an undeclared parameter as undeclared and leaves it in the name", () => {
    expect.hasAssertions();

    const entries: BlueprintEntry[] = [
      { key: "sheet", name: "{{parameter:a}} {{parameter:c}}", type: ResourceType.Sheet },
    ];

    expect(buildBlueprintDeployReviews(entries, parameterValues)).toStrictEqual([
      {
        description: "undeclared {{parameter:c}}",
        icon: ResourceDefinitionMap[ResourceType.Sheet].icon,
        isNameEmpty: false,
        key: "sheet",
        title: "b {{parameter:c}}",
      },
    ]);
  });

  test("blocks an entry whose name resolves to empty and shows its alias as the title", () => {
    expect.hasAssertions();

    const entries: BlueprintEntry[] = [{ key: "sheet", name: "{{parameter:a}}", type: ResourceType.Sheet }];

    expect(buildBlueprintDeployReviews(entries, { a: "" })).toStrictEqual([
      {
        description: "no name: a parameter it uses is empty",
        icon: ResourceDefinitionMap[ResourceType.Sheet].icon,
        isNameEmpty: true,
        key: "sheet",
        title: "sheet",
      },
    ]);
  });

  test("notes the entry keys its content binds to", () => {
    expect.hasAssertions();

    const entries: BlueprintEntry[] = [
      { content: { body: "{{entry:audience}}" }, key: "sheet", name: "Sheet", type: ResourceType.Sheet },
    ];

    expect(buildBlueprintDeployReviews(entries, parameterValues)).toStrictEqual([
      {
        description: "binds audience",
        icon: ResourceDefinitionMap[ResourceType.Sheet].icon,
        isNameEmpty: false,
        key: "sheet",
        title: "Sheet",
      },
    ]);
  });

  test("does not note bindings inside a nested blueprint's own content", () => {
    expect.hasAssertions();

    const entries: BlueprintEntry[] = [
      { content: { body: "{{entry:audience}}" }, key: "child", name: "Child", type: ResourceType.Blueprint },
    ];

    expect(buildBlueprintDeployReviews(entries, parameterValues)).toStrictEqual([
      {
        description: "",
        icon: ResourceDefinitionMap[ResourceType.Blueprint].icon,
        isNameEmpty: false,
        key: "child",
        title: "Child",
      },
    ]);
  });
});
