import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { getComponentReferenceIds } from "#src/services/genshinParity/passes/getComponentReferenceIds";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/shared/ParityReferenceMap"), async () => {
  const { DerivedAssetComponent: Component } = await import("#src/models/genshinAssets/shared/DerivedAssetComponent");
  return {
    ParityReferenceMap: {
      "login-door": { component: Component.Login, screen: "LoginScreen", wikiTitle: "File:Door.png" },
      "login-door-backdrop": {
        component: Component.Login,
        isBackdrop: true,
        screen: "LoginScreen",
        wikiTitle: "File:Backdrop.png",
      },
      "windrise-statue": { component: Component.Windrise, screen: "LoginScreen", wikiTitle: "File:Statue.png" },
    } satisfies Record<string, ParityReference>,
  };
});

describe(getComponentReferenceIds, () => {
  test("reads only the references naming the component, never a backdrop", () => {
    expect.hasAssertions();

    expect(getComponentReferenceIds(DerivedAssetComponent.Login)).toStrictEqual(["login-door"]);
  });

  test("reads a screen several components share by each component's own references", () => {
    expect.hasAssertions();

    expect(getComponentReferenceIds(DerivedAssetComponent.Windrise)).toStrictEqual(["windrise-statue"]);
  });
});
