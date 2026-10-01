import type { SkyTargets } from "#src/atmosphere/SkyTargets";

import { applySkyState } from "#src/atmosphere/applySkyState";
import { DEFAULT_SKY_SHAPE } from "#src/atmosphere/constants";
import { createSkyState } from "#src/atmosphere/createSkyState";
import { createSkyUniforms } from "#src/atmosphere/createSkyUniforms";
import { createLightUniforms } from "#src/nodes/createLightUniforms";
import { createFogUniforms } from "#src/post/createFogUniforms";
import { createPostUniforms } from "#src/post/createPostUniforms";
import { Color, DirectionalLight, HemisphereLight } from "three";
import { describe, expect, test } from "vitest";

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

describe(applySkyState, () => {
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

  test("hazes in the horizon's colour, or in the state's own fog colour where it sets one", () => {
    expect.hasAssertions();

    const skyState = createSkyState();
    const skyTargets = createSkyTargets();
    skyState.horizonColor.set(0xff0000);
    applySkyState(skyState, skyTargets);

    expect(skyTargets.fogUniforms.color.value.getHex()).toBe(0xff0000);

    applySkyState({ ...skyState, fogColor: new Color(0x00ff00) }, skyTargets);

    expect(skyTargets.fogUniforms.color.value.getHex()).toBe(0x00ff00);
  });

  test("writes a state's own sky shape, and the default's back for a state with none", () => {
    expect.hasAssertions();

    const skyTargets = createSkyTargets();
    const shape = { frontBackBlend: 0.5, haloHeight: 0.4, horizonBand: 0.9, moonSize: 2, sunHaloSize: 3 };
    applySkyState({ ...createSkyState(), shape }, skyTargets);

    expect(skyTargets.skyUniforms.horizonBand.value).toBe(shape.horizonBand);

    applySkyState(createSkyState(), skyTargets);

    expect(skyTargets.skyUniforms.horizonBand.value).toBe(DEFAULT_SKY_SHAPE.horizonBand);
  });
});
