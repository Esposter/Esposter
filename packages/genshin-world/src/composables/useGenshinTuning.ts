import type { GenshinTuningOptions } from "#src/models/GenshinTuningOptions";

import { isWebGPURenderer, useTres } from "@tresjs/core";
import { until } from "@vueuse/core";
import { computeGradeLut, computeRampValues, MINUTES_PER_DAY } from "genshin-engine";
import { InspectorBase } from "three/webgpu";

const TINT_RANGE = 0.1;
// A tint's channels by the tuple key the panel writes through
const TINT_CHANNELS = [
  { key: "0", name: "red" },
  { key: "1", name: "green" },
  { key: "2", name: "blue" },
] as const;
// Development's tuning panel: three's inspector over the look's every uniform, so the hour, clouds, wind, ramp,
// Rim, outline, fog, water, grade, god rays and bloom are set against reference screenshots rather than guessed. A
// Slider writes the uniform or the texture it drives at once, and nothing is saved: a value that looks right is
// Copied into the region's constants. The inspector is imported only here, so a production build never loads it
export const useGenshinTuning = ({
  fogUniforms,
  gameClock,
  gradeLutTexture,
  gradeOptions,
  lightUniforms,
  postPipeline,
  postUniforms,
  rampOptions,
  rampTexture,
  skyUniforms,
  waterUniforms,
  windUniforms,
}: GenshinTuningOptions) => {
  const { renderer } = useTres();
  const ramp = { ...rampOptions };
  const grade = structuredClone(gradeOptions);
  const writeRamp = () => {
    const rampValues = computeRampValues(ramp);
    rampTexture.image.data?.set(rampValues);
    rampTexture.needsUpdate = true;
  };
  const writeGrade = () => {
    const gradeValues = computeGradeLut(grade);
    gradeLutTexture.image.data?.set(gradeValues);
    gradeLutTexture.needsUpdate = true;
  };
  let isActive = true;

  onMounted(async () => {
    const { Inspector } = await import("three/examples/jsm/inspector/Inspector.js");
    const pipeline = await until(postPipeline).toBeTruthy();
    if (!isActive || !isWebGPURenderer(renderer)) return;
    const inspector = new Inspector();
    renderer.inspector = inspector;
    const parameters = inspector.createParameters("Look").close();

    const skyFolder = parameters.addFolder("Sky");
    skyFolder.add(gameClock, "minutes", 0, MINUTES_PER_DAY, 1).name("minutes into the day").listen();
    // Zero holds the hour still to compare it against a screenshot
    skyFolder.add(gameClock, "minutesPerSecond", 0, 60, 1).name("minutes a second");
    skyFolder.add(skyUniforms.cloudCoverage, "value", 0, 1, 0.01).name("cloud coverage");

    const windFolder = parameters.addFolder("Wind");
    windFolder.add(windUniforms.strength, "value", 0, 2, 0.01).name("strength");
    windFolder.add(windUniforms.gustStrength, "value", 0, 2, 0.01).name("gust strength");
    windFolder.add(windUniforms.gustWidth, "value", 1, 100, 1).name("gust width");
    windFolder.add(windUniforms.gustSpeed, "value", 0, 30, 0.1).name("gust speed");

    const rampFolder = parameters.addFolder("Ramp");
    rampFolder.add(ramp, "terminator", 0, 1, 0.01).onChange(writeRamp);
    rampFolder.add(ramp, "softness", 0.01, 0.5, 0.01).onChange(writeRamp);

    const rimFolder = parameters.addFolder("Rim");
    rimFolder.add(lightUniforms.rimStrength, "value", 0, 2, 0.01).name("strength");
    rimFolder.addColor(lightUniforms.rimColor, "value").name("colour");

    const outlineFolder = parameters.addFolder("Outline");
    outlineFolder.add(postUniforms.outlineThickness, "value", 0, 0.01, 0.0001).name("thickness");
    outlineFolder.add(postUniforms.outlineFadeDistance, "value", 1, 200, 1).name("fade distance");
    outlineFolder.addColor(postUniforms.outlineColor, "value").name("colour");

    const fogFolder = parameters.addFolder("Fog");
    fogFolder.add(fogUniforms.density, "value", 0, 0.01, 0.0001).name("density");
    fogFolder.add(fogUniforms.heightFalloff, "value", 0, 0.2, 0.001).name("height falloff");
    fogFolder.add(fogUniforms.baseHeight, "value", -50, 100, 1).name("base height");
    fogFolder.add(fogUniforms.startDistance, "value", 0, 300, 1).name("start distance");
    fogFolder.addColor(fogUniforms.color, "value").name("colour");

    const waterFolder = parameters.addFolder("Water");
    waterFolder.add(waterUniforms.level, "value", -20, 20, 0.1).name("level");
    waterFolder.addColor(waterUniforms.shallowColor, "value").name("shallow colour");
    waterFolder.addColor(waterUniforms.deepColor, "value").name("deep colour");
    waterFolder.add(waterUniforms.deepDepth, "value", 0.5, 30, 0.1).name("deep depth");
    waterFolder.add(waterUniforms.foamDepth, "value", 0, 3, 0.01).name("foam depth");
    waterFolder.add(waterUniforms.causticStrength, "value", 0, 2, 0.01).name("caustics");
    waterFolder.addColor(waterUniforms.underwaterFogColor, "value").name("underwater fog colour");
    waterFolder.add(waterUniforms.underwaterFogDensity, "value", 0, 0.5, 0.001).name("underwater fog density");

    const gradeFolder = parameters.addFolder("Grade");
    gradeFolder.add(postUniforms.gradeIntensity, "value", 0, 1, 0.01).name("intensity");
    gradeFolder.add(grade, "contrast", 0.5, 1.5, 0.01).onChange(writeGrade);
    gradeFolder.add(grade, "saturation", 0, 2, 0.01).onChange(writeGrade);
    for (const { key, name } of TINT_CHANNELS) {
      gradeFolder
        .add(grade.shadowTint, key, -TINT_RANGE, TINT_RANGE, 0.001)
        .name(`shadow ${name}`)
        .onChange(writeGrade);
      gradeFolder
        .add(grade.highlightTint, key, -TINT_RANGE, TINT_RANGE, 0.001)
        .name(`highlight ${name}`)
        .onChange(writeGrade);
    }

    const { bloomNode, godraysNode } = pipeline;
    if (godraysNode) {
      const godraysFolder = parameters.addFolder("God rays");
      godraysFolder.add(godraysNode.density, "value", 0, 1, 0.01).name("density");
      godraysFolder.add(godraysNode.maxDensity, "value", 0, 1, 0.01).name("max density");
      godraysFolder.add(godraysNode.distanceAttenuation, "value", 0, 5, 0.01).name("distance attenuation");
      godraysFolder.addColor(postUniforms.godraysColor, "value").name("colour");
    }

    if (bloomNode) {
      const bloomFolder = parameters.addFolder("Bloom");
      bloomFolder.add(bloomNode.strength, "value", 0, 2, 0.01).name("strength");
      bloomFolder.add(bloomNode.radius, "value", 0, 1, 0.01).name("radius");
      bloomFolder.add(bloomNode.threshold, "value", 0, 1, 0.01).name("threshold");
    }
  });

  onUnmounted(() => {
    isActive = false;
    if (isWebGPURenderer(renderer)) renderer.inspector = new InspectorBase();
  });
};
