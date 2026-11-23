// @vitest-environment nuxt
import type { CallBackground } from "#shared/models/message/call/CallBackground";

import { CallVirtualBackgroundDefinitions } from "#src/services/message/room/call/CallVirtualBackgroundDefinitions";
import { getCallBackgroundSelection } from "#src/services/message/room/call/getCallBackgroundSelection";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCallBackgroundStore } from "#src/store/message/user/settings/callBackground";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe(useCallBackgroundStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const callBackground: CallBackground = { presignedUrl: "presignedUrl", slot: 0 };

  test("resolves a slot to its signed url", async () => {
    expect.hasAssertions();

    trpcMsw.user.readCallBackgrounds.query(() => [callBackground]);
    const callBackgroundStore = useCallBackgroundStore();
    const { readVirtualBackgroundImagePath } = callBackgroundStore;

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe(
      callBackground.presignedUrl,
    );
  });

  // A background the user deleted elsewhere still names its slot in the settings row, and the pipeline must
  // Land on the same disabled processor the None entry selects rather than on a broken image
  test("resolves a slot that no longer exists to no background", async () => {
    expect.hasAssertions();

    trpcMsw.user.readCallBackgrounds.query(() => []);
    const callBackgroundStore = useCallBackgroundStore();
    const { readVirtualBackgroundImagePath } = callBackgroundStore;

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe("");
  });

  // The listing the picker renders from is cached for the session, so resolving through it would hand the Processor a
  // Url for a blob another device deleted — and a presigned read url that expires while the session stays open
  test("re-reads the listing rather than resolving a slot from a warm cache", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => CallBackground[]>(() => [callBackground]);
    trpcMsw.user.readCallBackgrounds.query(handler);
    const callBackgroundStore = useCallBackgroundStore();
    const { readCallBackgrounds, readVirtualBackgroundImagePath } = callBackgroundStore;
    await readCallBackgrounds();
    handler.mockReturnValue([]);

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe("");
    expect(handler).toHaveBeenCalledTimes(2);
  });

  // Only a slot needs the listing, so a preset never spends a request resolving to the path it already is
  test("resolves every preset to its url without reading the listing", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => CallBackground[]>(() => []);
    trpcMsw.user.readCallBackgrounds.query(handler);
    const callBackgroundStore = useCallBackgroundStore();
    const { readVirtualBackgroundImagePath } = callBackgroundStore;

    await expect(
      Promise.all(CallVirtualBackgroundDefinitions.map(({ id }) => readVirtualBackgroundImagePath(id))),
    ).resolves.toStrictEqual(CallVirtualBackgroundDefinitions.map(({ url }) => url));
    expect(handler).not.toHaveBeenCalled();
  });

  // The blob is reclaimed by a worker after the delete answers, so the listing keeps the slot until its topic changes:
  // The slot leaves the picker when the server says so, not when the user clicks
  test("keeps a slot listed while its delete is in flight", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<void>();
    trpcMsw.user.readCallBackgrounds.query(() => [callBackground]);
    trpcMsw.user.deleteCallBackground.mutation(() => promise);
    const callBackgroundStore = useCallBackgroundStore();
    const { callBackgrounds } = storeToRefs(callBackgroundStore);
    const { deleteCallBackground, readCallBackgrounds } = callBackgroundStore;
    await readCallBackgrounds();
    const deleting = deleteCallBackground(callBackground.slot);
    await flushPromises();
    const listedWhileInFlight = callBackgrounds.value;
    resolve();
    await deleting;

    expect(listedWhileInFlight).toStrictEqual([callBackground]);
  });
});
