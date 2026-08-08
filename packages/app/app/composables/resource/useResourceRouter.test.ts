import { hasCapability } from "#shared/services/resource/hasCapability";
import { trpcRouter } from "@@/server/trpc/routers";
import { ResourceType, ResourceTypes } from "@esposter/db-schema";
import { uncapitalize } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// Every type stores content and is renamable and deletable, so these ride on all ten routers — they are
// What useResource calls for any resource the route names, before it knows which type it opened
const BASE_PROCEDURE_NAMES = ["deleteResource", "readResourceContent", "saveResourceContent", "updateResource"];
const FILE_PROCEDURE_NAMES = ["deleteFile", "generateUploadFileSasEntities"];
const PUBLISH_PROCEDURE_NAMES = [
  "publishResource",
  "readResourcePublication",
  "readResourceViewCount",
  "unpublishResource",
];

const getResourceRouterProcedureNames = (type: ResourceType) => {
  const prefix = `${uncapitalize(type)}.`;
  return Object.keys(trpcRouter._def.procedures)
    .filter((path) => path.startsWith(prefix))
    .map((path) => path.slice(prefix.length));
};

// The dispatch from a resource type to its procedures is the type's own name, uncapitalized — no map. What
// That trades away is the map's one virtue: a missing entry was visible in one file. These pin the
// Correspondence instead, so a router renamed or never registered fails here rather than at the first click.
// Asserted against the server registry, not the client: the tRPC client is a lazy proxy that answers to every
// Key, so it can say nothing about which procedures a type actually has
describe(useResourceRouter, () => {
  test.each(ResourceTypes)("registers a router named after %s", (type) => {
    expect.hasAssertions();

    expect(getResourceRouterProcedureNames(type)).not.toStrictEqual([]);
  });

  test.each(ResourceTypes)("exposes the base procedures on %s", (type) => {
    expect.hasAssertions();

    expect(getResourceRouterProcedureNames(type)).toStrictEqual(expect.arrayContaining(BASE_PROCEDURE_NAMES));
  });

  // The capability is what makes the procedure reachable, so a type declaring one without the other leaves
  // Either a publish button that 404s or a publishable resource with no way to publish it
  test.each(ResourceTypes)("exposes the publish procedures on %s exactly where the capability is declared", (type) => {
    expect.hasAssertions();

    const procedureNames = getResourceRouterProcedureNames(type);
    expect(PUBLISH_PROCEDURE_NAMES.filter((procedureName) => procedureNames.includes(procedureName))).toStrictEqual(
      hasCapability(type, "publishable") ? PUBLISH_PROCEDURE_NAMES : [],
    );
  });

  test.each(ResourceTypes)("exposes the file procedures on %s exactly where the capability is declared", (type) => {
    expect.hasAssertions();

    const procedureNames = getResourceRouterProcedureNames(type);
    expect(FILE_PROCEDURE_NAMES.filter((procedureName) => procedureNames.includes(procedureName))).toStrictEqual(
      hasCapability(type, "fileAssets") ? FILE_PROCEDURE_NAMES : [],
    );
  });

  test("uncapitalizes a multi-word type to its router key", () => {
    expect.hasAssertions();
    // The one type whose key is not simply its lowercased name — a naive toLowerCase would look for `todolist`
    expect(uncapitalize(ResourceType.TodoList)).toBe("todoList");
  });
});
