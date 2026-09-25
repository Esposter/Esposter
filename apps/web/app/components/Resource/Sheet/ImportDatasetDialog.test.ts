// @vitest-environment nuxt
import ResourceSheetImportDatasetDialog from "@/components/Resource/Sheet/ImportDatasetDialog.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("resourceSheetImportDatasetDialog", () => {
  const server = setupMswTrpc();

  // A failed import leaves the sheet as it was, so the dialog stays with the survey picked to try again
  test("stays open when the import fails", async () => {
    expect.hasAssertions();

    const survey = createResourceListItem();
    server.use(
      trpcMsw.survey.readResources.query(() => ({ hasMore: false, items: [{ ...survey, publication: null }] })),
      trpcMsw.dataset.readDataset.query(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }),
    );
    const wrapper = await mountSuspended(ResourceSheetImportDatasetDialog, { props: { modelValue: false } });
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    wrapper.findComponent(UiSelect).vm.$emit("update:modelValue", survey.id);
    await flushPromises();
    const importButton = wrapper.findAll("button").find((button) => button.text() === "Import");
    assert.exists(importButton);
    await importButton.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
