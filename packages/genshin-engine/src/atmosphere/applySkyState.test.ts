import type { SkyTargets } from "#src/atmosphere/SkyTargets";

import { applySkyState } from "#src/atmosphere/applySkyState";
import { createSkyState } from "#src/atmosphere/createSkyState";
import { createSkyUniforms } from "#src/atmosphere/createSkyUniforms";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { createFogUniforms } from "#src/post/createFogUniforms";
import { createPostUniforms } from "#src/post/createPostUniforms";
import { DirectionalLight, HemisphereLight } from "three";
import { describe, expect, test } from "vitest";

describe(applySkyState, () => {
  const createSkyTargets = (): SkyTargets => ({
    fogUniforms: createFogUniforms(),
    godraysLight: new DirectionalLight(),
    hemisphere: new HemisphereLight(),
    light: new DirectionalLight(),
    lightDistance: 1,
    lightUniforms: createLightUniforms(),
    postUniforms: createPostUniforms(),
    skyUniforms: createSkyUniforms(),
  });

  test("redraws the god rays' map only once the light has turned far enough", () => {
    expect.hasAssertions();

    const skyState = createSkyState();
    const skyTargets = createSkyTargets();
    const { shadow } = skyTargets.godraysLight;
    skyState.lightDirection.set(0, 1, 0);
    applySkyState(skyState, skyTargets);
    shadow.needsUpdate = false;
    skyState.lightDirection.set(0.001, 1, 0).normalize();
    applySkyState(skyState, skyTargets);

    expect(shadow.needsUpdate).toBe(false);

    skyState.lightDirection.set(1, 1, 0).normalize();
    applySkyState(skyState, skyTargets);

    expect(shadow.needsUpdate).toBe(true);
  });
});
