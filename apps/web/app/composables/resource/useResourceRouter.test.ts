import type { ResourceType } from "@esposter/db-schema";

import { BaseProcedureNames } from "#server/models/resource/BaseProcedureNames";
import { FileProcedureNames } from "#server/models/resource/FileProcedureNames";
import { PublishProcedureNames } from "#server/models/resource/PublishProcedureNames";
import { trpcRouter } from "#server/trpc/routers/index";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceTypes } from "@esposter/db-schema";
import { uncapitalize } from "@esposter/shared";
import { describe, expect, test } from "vitest";

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
  // A multi-word type's key is not simply its lowercased name, so this is also what pins `todoList` over
  // `todolist`: a router registered under the wrong key contributes no procedures at all
  test.each(ResourceTypes)("%s: exposes the base procedures", (type) => {
    expect.hasAssertions();

    expect(getResourceRouterProcedureNames(type)).toStrictEqual(expect.arrayContaining([...BaseProcedureNames]));
  });

  // The capability is what makes the procedure reachable, so a type declaring one without the other leaves
  // Either a publish button that 404s or a publishable resource with no way to publish it
  test.each(ResourceTypes)("%s: exposes the publish procedures exactly where the capability is declared", (type) => {
    expect.hasAssertions();

    const procedureNames = getResourceRouterProcedureNames(type);

    expect(PublishProcedureNames.filter((procedureName) => procedureNames.includes(procedureName))).toStrictEqual(
      checkHasCapability(type, "publishable") ? PublishProcedureNames : [],
    );
  });

  test.each(ResourceTypes)("%s: exposes the file procedures exactly where the capability is declared", (type) => {
    expect.hasAssertions();

    const procedureNames = getResourceRouterProcedureNames(type);

    expect(FileProcedureNames.filter((procedureName) => procedureNames.includes(procedureName))).toStrictEqual(
      checkHasCapability(type, "fileAssets") ? FileProcedureNames : [],
    );
  });
});
