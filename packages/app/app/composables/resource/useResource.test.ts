// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";

import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useResource, () => {
  const server = setupMswTrpc();
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;
  const resourceId = crypto.randomUUID();
  const otherResourceId = crypto.randomUUID();
  const name = "name";
  const createResource = (id: string) =>
    ({ contentVersion: 0, id, name, type: ResourceType.Sheet, updatedAt: new Date(0) }) as Resource;

  beforeEach(() => {
    setActivePinia(createPinia());
    saveResourceContent = vi.fn<() => Resource>(() => ({ ...createResource(resourceId), contentVersion: 1 }));
    server.use(
      trpcMsw.resource.readResource.query(({ input }) => createResource(input.id)),
      trpcMsw.sheet.readResourceContent.query(() => createDefaultSheetResource()),
      trpcMsw.sheet.saveResourceContent.mutation(saveResourceContent),
    );
  });

  // `load()` swaps the loaded resource an await before the store re-seeds its content ref from `readContent`,
  // So a debounced autosave landing in between holds the previous resource's document — writing it replaces
  // This resource's content with another one's, under this one's id and contentVersion
  test("refuses a save while the content in hand still belongs to the previous resource", async () => {
    expect.hasAssertions();

    const id = ref(resourceId);
    const { load, readContent, save } = useResource(id);
    await load();
    await readContent();
    id.value = otherResourceId;
    await load();
    const isSuccessful = await save(createDefaultSheetResource());

    expect(isSuccessful).toBe(false);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("saves once the content has been read for the resource that is loaded", async () => {
    expect.hasAssertions();

    const id = ref(resourceId);
    const { load, readContent, save } = useResource(id);
    await load();
    await readContent();
    id.value = otherResourceId;
    await load();
    await readContent();
    const isSuccessful = await save(createDefaultSheetResource());

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });
});
