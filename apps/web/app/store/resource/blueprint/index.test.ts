// @vitest-environment nuxt
import type { BlueprintResource } from "#shared/models/resource/blueprint/BlueprintResource";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { createEmptyBlueprint } from "#src/services/resource/blueprint/createEmptyBlueprint";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useBlueprintStore } from "#src/store/resource/blueprint/index";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

const setupStore = async () => {
  const blueprintStore = useBlueprintStore();
  const { loadContent } = blueprintStore;
  await loadContent();
  return blueprintStore;
};

describe(useBlueprintStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const readerManifestJson = " ";
  const savedBlueprint: BlueprintResource = {
    entries: [{ key: "key", name: "name", type: ResourceType.Note }],
    parameters: [],
  };

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Blueprint }),
      publication: null,
    }));
    trpcMsw.blueprint.readResourceContent.query(() => createEmptyBlueprint());
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  // The rollback owes back the manifest text only while it is still the text this save wrote. Text the reader typed
  // While the save was in flight is theirs, and the refusal never replaced it
  test("keeps the manifest text the reader typed while a refused save was in flight", async () => {
    expect.hasAssertions();

    const { promise: saveGate, resolve: releaseSave } = Promise.withResolvers<void>();
    const { promise: isSaveReached, resolve: onSaveReached } = Promise.withResolvers<void>();
    trpcMsw.blueprint.saveResourceContent.mutation(async () => {
      onSaveReached();
      await saveGate;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const blueprintStore = await setupStore();
    const { saveBlueprint } = blueprintStore;
    const { manifestJson } = storeToRefs(blueprintStore);
    saveBlueprint(savedBlueprint);
    await isSaveReached;
    manifestJson.value = readerManifestJson;
    releaseSave();
    await waitForSynchronizedFunctions();
    await flushPromises();

    expect(manifestJson.value).toBe(readerManifestJson);
  });
});
