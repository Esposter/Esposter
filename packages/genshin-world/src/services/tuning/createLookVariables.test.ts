import { DevVariableKind } from "#src/models/dev/DevVariableKind";
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
  const createOptions = () => ({
    fogUniforms: createFogUniforms(),
    gameClock: { minutes: 0, minutesPerSecond: 0 },
    gradeLutTexture: new Data3DTexture(),
    gradeOptions: { contrast: 1, highlightTint: [0, 0, 0], saturation: 1, shadowTint: [0, 0, 0], size: 2 },
    lightUniforms: createLightUniforms(),
    postUniforms: createPostUniforms(),
    rampOptions: { resolution: 2, shade: 0, softness: 0.1, terminator: 0.5 },
    rampTexture: new DataTexture(),
    skyUniforms: createSkyUniforms(),
    waterUniforms: createWaterUniforms(),
    windUniforms: createWindUniforms(),
  });

  test("Look values are in the panel", () => {
    expect.hasAssertions();

    const options = createOptions();
    const registry = createDevRegistry();
    registry.register({ commands: [], variables: createLookVariables(options, {}) });

    expect(registry.run("set outline thickness 0.005")).toStrictEqual({ ok: true, value: 0.005 });
    expect(options.postUniforms.outlineThickness.value).toBe(0.005);
  });

  test("names each look variable and its kind, in the panel's order, without a bloom or god rays pass", () => {
    expect.hasAssertions();

    const variables = createLookVariables(createOptions(), {});

    expect(variables.map(({ kind, name }) => ({ kind, name }))).toStrictEqual([
      { kind: DevVariableKind.Number, name: "sky minutes" },
      { kind: DevVariableKind.Number, name: "sky minutes per second" },
      { kind: DevVariableKind.Number, name: "cloud coverage" },
      { kind: DevVariableKind.Number, name: "wind strength" },
      { kind: DevVariableKind.Number, name: "wind gust strength" },
      { kind: DevVariableKind.Number, name: "wind gust width" },
      { kind: DevVariableKind.Number, name: "wind gust speed" },
      { kind: DevVariableKind.Number, name: "ramp terminator" },
      { kind: DevVariableKind.Number, name: "ramp softness" },
      { kind: DevVariableKind.Number, name: "rim strength" },
      { kind: DevVariableKind.Colour, name: "rim colour" },
      { kind: DevVariableKind.Number, name: "outline thickness" },
      { kind: DevVariableKind.Number, name: "outline fade distance" },
      { kind: DevVariableKind.Colour, name: "outline colour" },
      { kind: DevVariableKind.Number, name: "fog density" },
      { kind: DevVariableKind.Number, name: "fog height falloff" },
      { kind: DevVariableKind.Number, name: "fog base height" },
      { kind: DevVariableKind.Number, name: "fog start distance" },
      { kind: DevVariableKind.Colour, name: "fog colour" },
      { kind: DevVariableKind.Number, name: "water level" },
      { kind: DevVariableKind.Colour, name: "water shallow colour" },
      { kind: DevVariableKind.Colour, name: "water deep colour" },
      { kind: DevVariableKind.Number, name: "water deep depth" },
      { kind: DevVariableKind.Number, name: "water foam depth" },
      { kind: DevVariableKind.Number, name: "water caustics" },
      { kind: DevVariableKind.Colour, name: "water underwater fog colour" },
      { kind: DevVariableKind.Number, name: "water underwater fog density" },
      { kind: DevVariableKind.Number, name: "grade intensity" },
      { kind: DevVariableKind.Number, name: "grade contrast" },
      { kind: DevVariableKind.Number, name: "grade saturation" },
      { kind: DevVariableKind.Number, name: "grade shadow red" },
      { kind: DevVariableKind.Number, name: "grade highlight red" },
      { kind: DevVariableKind.Number, name: "grade shadow green" },
      { kind: DevVariableKind.Number, name: "grade highlight green" },
      { kind: DevVariableKind.Number, name: "grade shadow blue" },
      { kind: DevVariableKind.Number, name: "grade highlight blue" },
    ]);
  });
});
