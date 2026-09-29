// @vitest-environment nuxt
import ResourceSheetImportDatasetDialog from "@/components/Resource/Sheet/ImportDatasetDialog.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("resourceSheetImportDatasetDialog", () => {
  const { trpcMsw } = setupMswTrpc();

  // A failed import leaves the sheet as it was, so the dialog stays with the survey picked to try again
  test("stays open when the import fails", async () => {
    expect.hasAssertions();

    const survey = createResourceListItem();
    const { promise: isSurveysRead, resolve: onSurveysRead } = Promise.withResolvers<void>();
    trpcMsw.survey.readResources.query(() => {
      onSurveysRead();
      return { hasMore: false, items: [{ ...survey, publication: null }] };
    });
    trpcMsw.dataset.readDataset.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const wrapper = await mountSuspended(ResourceSheetImportDatasetDialog, { props: { modelValue: false } });
    await wrapper.setProps({ modelValue: true });
    // Opening issues the read a batch later than a flush started now would cover, so the read's arrival is awaited
    await isSurveysRead;
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
