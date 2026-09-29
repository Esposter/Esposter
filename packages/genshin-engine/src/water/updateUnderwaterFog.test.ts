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
    const underwaterFogState = createUnderwaterFogState();
    updateUnderwaterFog(-1, waterUniforms, fogUniforms, underwaterFogState);
    const underwater = { density: fogUniforms.density.value, heightFalloff: fogUniforms.heightFalloff.value };
    updateUnderwaterFog(1, waterUniforms, fogUniforms, underwaterFogState);

    expect({
      above: { density: fogUniforms.density.value, heightFalloff: fogUniforms.heightFalloff.value },
      underwater,
    }).toStrictEqual({ above: { density: 0, heightFalloff: 1 }, underwater: { density: 1, heightFalloff: 0 } });
  });
});
