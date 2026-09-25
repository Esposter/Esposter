// @vitest-environment nuxt
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import DatasetReferencePicker from "@/components/Dataset/ReferencePicker.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { useSession } from "@/services/auth/authClient.test";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("datasetReferencePicker", () => {
  const server = setupMswTrpc();

  // Each provider type lists its own resources, and the list a type left behind can land after the one picked now.
  // Offered under the type on screen, a survey would be picked as a sheet and bound by an id no sheet has
  test("offers only the sources of the provider type on screen when an earlier type's read lands last", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const survey = createResourceListItem();
    const sheet = createResourceListItem();
    server.use(
      trpcMsw.survey.readResources.query(async () => {
        await readGate;
        return { hasMore: false, items: [survey] };
      }),
      trpcMsw.sheet.readResources.query(() => ({ hasMore: false, items: [sheet] })),
    );
    useSession.mockReturnValue(ref({ data: { user: { id: crypto.randomUUID() } } }));
    const wrapper = await mountSuspended(DatasetReferencePicker, { props: { modelValue: undefined } });
    const [typeSelect, sourceSelect] = wrapper.findAllComponents(UiSelect);
    typeSelect?.vm.$emit("update:modelValue", DatasetProviderType.Sheet);
    await flushPromises();
    releaseRead();
    await flushPromises();

    expect(
      (sourceSelect?.props("items") as UiSelectItem<string>[] | undefined)?.map(({ value }) => value),
    ).toStrictEqual(["", sheet.id]);
  });
});
