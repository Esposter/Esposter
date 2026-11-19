import type { openParityPage as baseOpenParityPage } from "#src/services/genshinParity/shared/openParityPage";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { describe, expect, test, vi } from "vitest";

const { openParityPage } = vi.hoisted(() => ({ openParityPage: vi.fn<typeof baseOpenParityPage>() }));

vi.mock(import("#src/services/genshinParity/shared/openParityPage"), () => ({ openParityPage }));

describe(openWitnessPage, () => {
  test("opens a reference's page in the state its variant names, not the screen's default", async () => {
    expect.hasAssertions();

    // The page is stopped once it is asked for, since only the arguments it was opened with are read here
    openParityPage.mockRejectedValue(new Error("stop after the page is requested"));

    await expect(
      openWitnessPage("login-screen-dusk", DerivedAssetComponent.Login, 640),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: stop after the page is requested]`);
    expect(openParityPage.mock.calls).toStrictEqual([
      [
        {
          height: 360,
          pageRoot: undefined,
          props: {},
          screen: "LoginScreen",
          variant: "dusk",
          width: 640,
          witness: DerivedAssetComponent.Login,
          witnessMeshes: undefined,
        },
      ],
    ]);
  });
});
