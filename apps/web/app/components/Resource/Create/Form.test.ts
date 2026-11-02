// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceCreateForm from "@/components/Resource/Create/Form.vue";
import ResourceCreateGallery from "@/components/Resource/Create/Gallery.vue";
import ResourceWhiteboardEditor from "@/components/Resource/Whiteboard/Editor.vue";
import { CreatableResourceTypes } from "@/models/resource/CreatableResourceType";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { RouterLink } from "vue-router";

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn<typeof navigateTo>() }));

mockNuxtImport("navigateTo", () => navigateToMock);

describe("resourceCreateForm", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const name = "name";

  beforeEach(() => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
  });

  test("a Whiteboard is created from the create flow", async () => {
    expect.hasAssertions();

    const gallery = await mountSuspended(ResourceCreateGallery, { global: { components: { RouterLink } } });

    expect(gallery.findAll("a").map((link) => link.attributes("href"))).toStrictEqual(
      CreatableResourceTypes.map((type) => RoutePath.ResourceExplorerCreateType(type)),
    );

    trpcMsw.whiteboard.createResource.mutation(() =>
      createResourceListItem({ id: resourceId, name, type: ResourceType.Whiteboard }),
    );
    const form = await mountSuspended(ResourceCreateForm, { props: { type: ResourceType.Whiteboard } });
    await form.get("input").setValue(name);
    await form.get("form").trigger("submit");
    await flushPromises();

    expect(navigateToMock).toHaveBeenCalledExactlyOnceWith(RoutePath.Resource(resourceId));

    // The new resource opens on the Whiteboard editor, where a freshly created one has no content blob and so an empty canvas
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Whiteboard }),
      publication: null,
    }));
    trpcMsw.whiteboard.readResourceContent.query(() => undefined);
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const editor = await mountSuspended(ResourceWhiteboardEditor);
    const whiteboardStore = useWhiteboardStore();
    const { whiteboard } = storeToRefs(whiteboardStore);

    expect(editor.find('[role="application"]').exists()).toBe(true);
    expect(whiteboard.value.elements).toStrictEqual([]);
  });
});
