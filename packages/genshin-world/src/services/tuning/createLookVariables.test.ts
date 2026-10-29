import { createDevRegistry } from "#src/services/dev/createDevRegistry";
import { createLookVariables } from "#src/services/tuning/createLookVariables";
import {
  createFogUniforms,
  createLightUniforms,
  createPostUniforms,
  createSkyUniforms,
  createWaterUniforms,
  createWindUniforms,
} from "genshin-engine";
import { Data3DTexture, DataTexture } from "three";
import { describe, expect, test } from "vitest";

describe(createLookVariables, () => {
  test("Look values are in the panel", () => {
    expect.hasAssertions();

    const postUniforms = createPostUniforms();
    const registry = createDevRegistry();
    registry.register({
      commands: [],
      variables: createLookVariables(
        {
          fogUniforms: createFogUniforms(),
          gameClock: { minutes: 0, minutesPerSecond: 0 },
          gradeLutTexture: new Data3DTexture(),
          gradeOptions: { contrast: 1, highlightTint: [0, 0, 0], saturation: 1, shadowTint: [0, 0, 0], size: 2 },
          lightUniforms: createLightUniforms(),
          postUniforms,
          rampOptions: { resolution: 2, shade: 0, softness: 0.1, terminator: 0.5 },
          rampTexture: new DataTexture(),
          skyUniforms: createSkyUniforms(),
          waterUniforms: createWaterUniforms(),
          windUniforms: createWindUniforms(),
        },
        {},
      ),
    });

    expect(registry.run("set outline thickness 0.005")).toStrictEqual({ ok: true, value: 0.005 });
    expect(postUniforms.outlineThickness.value).toBe(0.005);
  });
});
