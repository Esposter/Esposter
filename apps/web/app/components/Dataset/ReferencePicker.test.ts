// @vitest-environment nuxt
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import DatasetReferencePicker from "#src/components/Dataset/ReferencePicker.vue";
import UiSelect from "#src/components/Ui/Select/Index.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/auth/authClient"), () => import("#src/services/auth/authClient.test"));

describe("datasetReferencePicker", () => {
  const { trpcMsw } = setupMswTrpc();

  // Each provider type lists its own resources, and the list a type left behind can land after the one picked now.
  // Offered under the type on screen, a survey would be picked as a sheet and bound by an id no sheet has
  test("offers only the sources of the provider type on screen when an earlier type's read lands last", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const survey = createResourceListItem();
    const sheet = createResourceListItem();
    trpcMsw.survey.readResources.query(async () => {
      await readGate;
      return { items: [{ ...survey, publication: null }], nextCursor: "" };
    });
    trpcMsw.sheet.readResources.query(() => ({ items: [{ ...sheet, publication: null }], nextCursor: "" }));
    useSession.mockReturnValue(ref({ data: { user: { id: v7() } } }));
    const wrapper = await mountSuspended(DatasetReferencePicker, { props: { error: "", modelValue: undefined } });
    const [typeSelect, sourceSelect] = wrapper.findAllComponents(UiSelect);
    typeSelect?.vm.$emit("update:modelValue", DatasetProviderType.Sheet);
    await flushPromises();
    releaseRead();
    await flushPromises();

    expect(
      (sourceSelect?.props() as undefined | { items?: UiSelectItem<string>[] })?.items?.map(({ value }) => value),
    ).toStrictEqual(["", sheet.id]);
  });
});
