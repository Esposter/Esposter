import { hasCapability } from "#shared/services/resource/hasCapability";
import { trpcRouter } from "@@/server/trpc/routers";
import { ResourceType, ResourceTypes } from "@esposter/db-schema";
import { uncapitalize } from "@esposter/shared";
import { describe, expect, test } from "vitest";
// The dispatch from a resource type to its procedures is the type's own name, uncapitalized — no map. What
// That trades away is the map's one virtue: a missing entry was visible in one file. These pin the
// Correspondence instead, so a router renamed or never registered fails here rather than at the first click.
// Asserted against the server registry, not the client: the tRPC client is a lazy proxy that answers to every
// Key, so it can say nothing about which procedures a type actually has
describe(useResourceRouter, () => {
  const getResourceRouterProcedureNames = (type: ResourceType) => {
    const prefix = `${uncapitalize(type)}.`;
    return Object.keys(trpcRouter._def.procedures)
      .filter((path) => path.startsWith(prefix))
      .map((path) => path.slice(prefix.length));
  };

  test("registers a router named after every resource type", () => {
    expect.hasAssertions();

    for (const type of ResourceTypes) expect(getResourceRouterProcedureNames(type), type).not.toStrictEqual([]);
  });

  test("exposes the base procedures on every resource type", () => {
    expect.hasAssertions();

    // Every type stores content and is renamable and deletable, so these ride on all ten routers — they are
    // What useResource calls for any resource the route names, before it knows which type it opened
    for (const type of ResourceTypes)
      expect(getResourceRouterProcedureNames(type), type).toEqual(
        expect.arrayContaining(["deleteResource", "readResourceContent", "saveResourceContent", "updateResource"]),
      );
  });

  test("exposes the publish procedures exactly where the capability is declared", () => {
    expect.hasAssertions();

    // The capability is what makes the procedure reachable, so a type declaring one without the other leaves
    // Either a publish button that 404s or a publishable resource with no way to publish it
    for (const type of ResourceTypes) {
      const procedureNames = getResourceRouterProcedureNames(type);
      const isPublishable = hasCapability(type, "publishable");
      for (const procedureName of [
        "publishResource",
        "readResourcePublication",
        "readResourceViewCount",
        "unpublishResource",
      ])
        expect(procedureNames.includes(procedureName), `${type}.${procedureName}`).toBe(isPublishable);
    }
  });

  test("exposes the file procedures exactly where the capability is declared", () => {
    expect.hasAssertions();

    for (const type of ResourceTypes) {
      const procedureNames = getResourceRouterProcedureNames(type);
      const isFileAssets = hasCapability(type, "fileAssets");
      for (const procedureName of ["deleteFile", "generateUploadFileSasEntities"])
        expect(procedureNames.includes(procedureName), `${type}.${procedureName}`).toBe(isFileAssets);
    }
  });

  test("uncapitalizes a multi-word type to its router key", () => {
    expect.hasAssertions();
    // The one type whose key is not simply its lowercased name — a naive toLowerCase would look for `todolist`
    expect(uncapitalize(ResourceType.TodoList)).toBe("todoList");
  });
});
