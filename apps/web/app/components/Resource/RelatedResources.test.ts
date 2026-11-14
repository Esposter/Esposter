// @vitest-environment nuxt
import ResourceRelatedResources from "@/components/Resource/RelatedResources.vue";
import UiErrorState from "@/components/Ui/ErrorState.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe("resourceRelatedResources", () => {
  const { trpcMsw } = setupMswTrpc();
  const id = v7();
  const references = { consumers: [], dependencies: [], missingDependencyCount: 0 };
  const mountRelatedResources = () => mountSuspended(ResourceRelatedResources, { props: { id } });

  test("draws the loading columns while the references are out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.resource.readResourceReferences.query(async () => {
      await readGate;
      return references;
    });
    const component = await mountRelatedResources();

    expect(component.find('[aria-busy="true"]').exists()).toBe(true);
    expect(component.findAll("h3")).toHaveLength(0);

    releaseRead();
    await flushPromises();
  });

  test("a failed read draws the error state, and its retry reads the references again", async () => {
    expect.hasAssertions();

    const readResourceReferences = vi
      .fn<() => typeof references>()
      .mockImplementationOnce(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      })
      .mockReturnValue(references);
    trpcMsw.resource.readResourceReferences.query(readResourceReferences);
    const component = await mountRelatedResources();
    await flushPromises();

    expect(component.findComponent(UiErrorState).exists()).toBe(true);

    await component.findComponent(UiErrorState).get("button").trigger("click");
    await flushPromises();

    expect(readResourceReferences).toHaveBeenCalledTimes(2);
    expect(component.findAll("p").map((paragraph) => paragraph.text())).toStrictEqual([
      "No other resource uses this one.",
      "This resource uses no other.",
    ]);
  });
});
