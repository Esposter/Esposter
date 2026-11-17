// @vitest-environment nuxt
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceWebpageSettings from "#src/components/Resource/Webpage/Settings.vue";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useResourceStore } from "#src/store/resource/index";
import { useWebpageEditorStore } from "#src/store/webpageEditor/index";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe("resourceWebpageSettings", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Webpage }),
      publication: null,
    }));
    trpcMsw.webpage.readResourceContent.query(() => new WebpageEditor());
    trpcMsw.webpage.readResourcePublication.query(() => undefined);
    const resourceStore = useResourceStore();
    await resourceStore.readResource();
  });

  // The switch edits the content the autosave watches, so the owner's choice is the one the next save writes
  test("the owner turns search listing off", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceWebpageSettings);
    await flushPromises();
    await component.get('[role="switch"]').trigger("click");
    await flushPromises();
    const webpageEditorStore = useWebpageEditorStore();

    expect(webpageEditorStore.webpageEditor.isIndexable).toBe(false);
  });
});
