import { createFogUniforms } from "#src/post/createFogUniforms";
import { createUnderwaterFogState } from "#src/water/createUnderwaterFogState";
import { createWaterUniforms } from "#src/water/createWaterUniforms";
import { updateUnderwaterFog } from "#src/water/updateUnderwaterFog";
import { describe, expect, test } from "vitest";

describe(updateUnderwaterFog, () => {
  test("thickens the fog under the water and gives the fog above back on surfacing", () => {
    expect.hasAssertions();

    const waterUniforms = createWaterUniforms();
    waterUniforms.underwaterFogDensity.value = 1;
    const fogUniforms = createFogUniforms();
    fogUniforms.heightFalloff.value = 1;
    fogUniforms.maxOpacity.value = 0.5;
    const underwaterFogState = createUnderwaterFogState();
    updateUnderwaterFog(-1, waterUniforms, fogUniforms, underwaterFogState);
    const underwater = {
      density: fogUniforms.density.value,
      heightFalloff: fogUniforms.heightFalloff.value,
      maxOpacity: fogUniforms.maxOpacity.value,
    };
    updateUnderwaterFog(1, waterUniforms, fogUniforms, underwaterFogState);

    expect({
      above: {
        density: fogUniforms.density.value,
        heightFalloff: fogUniforms.heightFalloff.value,
        maxOpacity: fogUniforms.maxOpacity.value,
      },
      underwater,
    }).toStrictEqual({
      above: { density: 0, heightFalloff: 1, maxOpacity: 0.5 },
      underwater: { density: 1, heightFalloff: 0, maxOpacity: 1 },
    });
  });

  test("keeps the water's density under it, and gives back a density written above meanwhile on surfacing", () => {
    expect.hasAssertions();

    const waterUniforms = createWaterUniforms();
    waterUniforms.underwaterFogDensity.value = 1;
    const fogUniforms = createFogUniforms();
    const underwaterFogState = createUnderwaterFogState();
    updateUnderwaterFog(-1, waterUniforms, fogUniforms, underwaterFogState);
    fogUniforms.density.value = 0.5;
    updateUnderwaterFog(-1, waterUniforms, fogUniforms, underwaterFogState);
    const underwaterDensity = fogUniforms.density.value;
    updateUnderwaterFog(1, waterUniforms, fogUniforms, underwaterFogState);

    expect({ aboveDensity: fogUniforms.density.value, underwaterDensity }).toStrictEqual({
      aboveDensity: 0.5,
      underwaterDensity: 1,
    });
  });
});
