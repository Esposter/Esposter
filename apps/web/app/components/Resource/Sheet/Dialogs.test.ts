// @vitest-environment nuxt
import ResourceSheetDialogs from "@/components/Resource/Sheet/Dialogs.vue";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("resourceSheetDialogs", () => {
  const server = setupMswTrpc();

  // The revision is the import's undo, so an import whose revision did not land does not proceed — and its preview
  // Stays for the reader to try again rather than closing over a sheet that was never replaced
  test("keeps the import preview open when its revision fails", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.resource.saveResourceRevision.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }),
    );
    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { currentResourceId } = storeToRefs(resourceStore);
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { isPreviewOpen } = storeToRefs(sheetPortableDialogStore);
    const { openPreview } = sheetPortableDialogStore;
    const wrapper = await mountSuspended(ResourceSheetDialogs);
    openPreview(currentResourceId.value, createDataSource(), "");
    await flushPromises();
    const importButton = wrapper.findAll("button").find((button) => button.text() === "Import");
    assert.exists(importButton);
    await importButton.trigger("click");
    await flushPromises();

    expect(isPreviewOpen.value).toBe(true);
  });
});
