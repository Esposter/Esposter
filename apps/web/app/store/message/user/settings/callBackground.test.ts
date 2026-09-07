// @vitest-environment nuxt
import type { CallBackground } from "#shared/models/message/call/CallBackground";

import { CallVirtualBackgroundDefinitions } from "@/services/message/room/call/CallVirtualBackgroundDefinitions";
import { getCallBackgroundSelection } from "@/services/message/room/call/getCallBackgroundSelection";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useCallBackgroundStore } from "@/store/message/user/settings/callBackground";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useCallBackgroundStore, () => {
  const server = setupMswTrpc();
  const callBackground: CallBackground = { sasUrl: "https://mock/0?sig=mock", slot: 0 };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("resolves a slot to its signed url", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.user.readCallBackgrounds.query(() => [callBackground]));
    const callBackgroundStore = useCallBackgroundStore();
    const { readVirtualBackgroundImagePath } = callBackgroundStore;

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe(
      callBackground.sasUrl,
    );
  });

  // A background the user deleted elsewhere still names its slot in the settings row, and the pipeline must
  // Land on the same disabled processor the None entry selects rather than on a broken image
  test("resolves a slot that no longer exists to no background", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.user.readCallBackgrounds.query(() => []));
    const callBackgroundStore = useCallBackgroundStore();
    const { readVirtualBackgroundImagePath } = callBackgroundStore;

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe("");
  });

  // The listing the picker renders from is cached for the session, so resolving through it would hand the
  // Processor a url for a blob another device deleted — and a read SAS that expires while the session stays open
  test("re-reads the listing rather than resolving a slot from a warm cache", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => CallBackground[]>(() => [callBackground]);
    server.use(trpcMsw.user.readCallBackgrounds.query(handler));
    const callBackgroundStore = useCallBackgroundStore();
    const { readCallBackgrounds, readVirtualBackgroundImagePath } = callBackgroundStore;
    await readCallBackgrounds();
    handler.mockReturnValue([]);

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe("");
    expect(handler).toHaveBeenCalledTimes(2);
  });

  // Only a slot needs the listing, so a preset never spends a request resolving to the path it already is
  test("resolves a preset without reading the listing", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => CallBackground[]>(() => []);
    server.use(trpcMsw.user.readCallBackgrounds.query(handler));
    const callBackgroundStore = useCallBackgroundStore();
    const { readVirtualBackgroundImagePath } = callBackgroundStore;
    // The last preset rather than the first, because the first is the None entry and resolves to the empty
    // Sentinel either way — which would pass whether or not presets are resolved at all
    const { imagePath } = takeOne(CallVirtualBackgroundDefinitions.slice(-1));

    await expect(readVirtualBackgroundImagePath(imagePath)).resolves.toBe(imagePath);
    expect(handler).not.toHaveBeenCalled();
  });

  // Each slot is its own write target, so two deletes run concurrently rather than queueing and a rejected one
  // Must put back only its own row
  test("a rejected delete does not resurrect a slot deleted beside it", async () => {
    expect.hasAssertions();

    const callBackgrounds = [callBackground, { sasUrl: "https://mock/1?sig=mock", slot: 1 }];
    server.use(
      trpcMsw.user.readCallBackgrounds.query(() => callBackgrounds),
      trpcMsw.user.deleteCallBackground.mutation(({ input }) => {
        if (input.slot === 0) throw new Error("mock");
        return undefined;
      }),
    );
    const callBackgroundStore = useCallBackgroundStore();
    const { deleteCallBackground, readCallBackgrounds } = callBackgroundStore;
    await readCallBackgrounds();
    await Promise.all([deleteCallBackground(1), deleteCallBackground(0)]);

    // Slot 1's delete landed, so only slot 0 — whose delete was rejected — comes back
    expect(callBackgroundStore.callBackgrounds).toStrictEqual([callBackground]);
  });
});
