// @vitest-environment nuxt
import type { ResourceTagCount } from "#shared/models/resource/ResourceTagCount";

import ResourceTagList from "@/components/Resource/TagList.vue";
import UiEmptyState from "@/components/Ui/EmptyState.vue";
import UiErrorState from "@/components/Ui/ErrorState.vue";
import UiItemContent from "@/components/Ui/ItemContent.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe("resourceTagList", () => {
  const { trpcMsw } = setupMswTrpc();

  test("draws the loading rows while the counts are out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.resource.readResourceTagCounts.query(async () => {
      await readGate;
      return [];
    });
    const component = await mountSuspended(ResourceTagList);

    expect(component.findAll(".skeleton")).toHaveLength(8);
    expect(component.findComponent(UiItemContent).exists()).toBe(false);

    releaseRead();
    await flushPromises();
  });

  test("a failed read draws the error state, and its retry reads the counts again", async () => {
    expect.hasAssertions();

    const name = "a";
    const count = 1;
    const readResourceTagCounts = vi
      .fn<() => ResourceTagCount[]>()
      .mockImplementationOnce(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      })
      .mockReturnValue([{ count, name }]);
    trpcMsw.resource.readResourceTagCounts.query(readResourceTagCounts);
    const component = await mountSuspended(ResourceTagList);
    await flushPromises();

    expect(component.findComponent(UiErrorState).exists()).toBe(true);

    await component.get("button").trigger("click");
    await flushPromises();

    expect(readResourceTagCounts).toHaveBeenCalledTimes(2);
    expect(component.findAllComponents(UiItemContent).map((item) => item.props("title"))).toStrictEqual([name]);
  });

  test("a read that returned no tags says so", async () => {
    expect.hasAssertions();

    trpcMsw.resource.readResourceTagCounts.query(() => []);
    const component = await mountSuspended(ResourceTagList);
    await flushPromises();

    expect(component.findComponent(UiEmptyState).props("title")).toBe("No tags yet");
  });

  test("the tags are listed by name", async () => {
    expect.hasAssertions();

    const name = "a";
    trpcMsw.resource.readResourceTagCounts.query(() => [{ count: 1, name }]);
    const component = await mountSuspended(ResourceTagList);
    await flushPromises();

    expect(component.findAllComponents(UiItemContent).map((item) => item.props("title"))).toStrictEqual([name]);
  });
});
