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
    const { readVirtualBackgroundImagePath } = useCallBackgroundStore();

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe(
      callBackground.sasUrl,
    );
  });

  // A background the user deleted elsewhere still names its slot in the settings row, and the pipeline must
  // Land on the same disabled processor the None entry selects rather than on a broken image
  test("resolves a slot that no longer exists to no background", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.user.readCallBackgrounds.query(() => []));
    const { readVirtualBackgroundImagePath } = useCallBackgroundStore();

    await expect(readVirtualBackgroundImagePath(getCallBackgroundSelection(callBackground))).resolves.toBe("");
  });

  // Only a slot needs the listing, so a preset never spends a request resolving to the path it already is
  test("resolves a preset without reading the listing", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => CallBackground[]>(() => []);
    server.use(trpcMsw.user.readCallBackgrounds.query(handler));
    const { readVirtualBackgroundImagePath } = useCallBackgroundStore();
    // The last preset rather than the first, because the first is the None entry and resolves to the empty
    // Sentinel either way — which would pass whether or not presets are resolved at all
    const { imagePath } = takeOne(CallVirtualBackgroundDefinitions.slice(-1));

    await expect(readVirtualBackgroundImagePath(imagePath)).resolves.toBe(imagePath);
    expect(handler).not.toHaveBeenCalled();
  });
});
