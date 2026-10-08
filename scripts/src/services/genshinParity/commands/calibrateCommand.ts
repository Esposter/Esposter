import type { SubCommandsDef } from "citty";
import type { StoneLight } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { STONE_LIGHT_PATH } from "#src/services/genshinParity/witness/constants";
import { solveReferenceHaze } from "#src/services/genshinParity/witness/solveReferenceHaze";
import { solveReferenceStoneLight } from "#src/services/genshinParity/witness/solveReferenceStoneLight";
import { parseNames } from "#src/services/shared/parseNames";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The decimals a written light keeps, past which its colours move nothing the screen shows
const LIGHT_DECIMALS = 4;
const formatColor = (color: readonly number[]): string => color.map((value) => value.toFixed(3)).join(" ");
const roundColor = (color: readonly number[]): number[] => color.map((value) => Number(value.toFixed(LIGHT_DECIMALS)));

export const calibrateCommand: SubCommandsDef[string] = defineCommand({
  args: {
    darkening: {
      description:
        "The rate a metre up the light darkens at with height, held through the solve; the light written for the reference's hour keeps its own when none is given",
      type: "string",
    },
    reference: {
      description:
        "A reference's id in ParityReferenceMap, or with --haze references' ids at one hour, separated by commas",
      required: true,
      type: "positional",
    },
    haze: {
      default: false,
      description:
        "Refine the haze's density, height falloff and most opacity over every reference given, on what it leaves of the stone as the display shows it under a light free in each part's bin, and print them beside the residuals under the scene's own haze and none",
      type: "boolean",
    },
    self: {
      default: false,
      description:
        "Solve against the exports as the scene draws them under its own light rather than the reference, which should hand that light back if the solve models the renderer",
      type: "boolean",
    },
    witness: {
      description: "The component whose exports the witness draws",
      options: Object.values(DerivedAssetComponent),
      required: true,
      type: "enum",
    },
    write: {
      default: false,
      description: `Write the solved light into the world's ${STONE_LIGHT_PATH} under the reference's time of day`,
      type: "boolean",
    },
  },
  meta: {
    description:
      "Solve a reference's stone light as the game's deferred pass casts it, its toon ramp, its sky's harmonics and its light fading with height, with the haze's colours over the stone at the scene's haze's opacity, by non-negative least squares over lights that never go below none, over the witness's G-buffer, printing the residual against the bins' spread",
    name: "calibrate",
  },
  run: async ({ args }) => {
    // The haze lives in the scene's sky state, not the world's data, so a light written beside it would be drawn under
    // A haze it was not solved under: the haze is set first, and the light written under the scene's own
    if (args.haze && args.write)
      throw new InvalidOperationError(Operation.Update, STONE_LIGHT_PATH, "--haze solves a haze --write cannot set");
    if (args.haze) {
      const { haze, noneResidual, residual, sceneResidual } = await solveReferenceHaze(
        parseNames(args.reference, "reference"),
        args.witness,
      );
      console.log(
        `haze density ${haze.density.toPrecision(4)}, height falloff ${haze.heightFalloff.toFixed(4)}, most opacity ${haze.maxOpacity.toFixed(4)}: residual ${residual.toFixed(4)}, against ${sceneResidual.toFixed(4)} under the scene's own and ${noneResidual.toFixed(4)} under none`,
      );
      return;
    }
    const timeOfDay = ParityReferenceMap[args.reference]?.props?.timeOfDay;
    const lights = existsSync(join(WORLD_DATA_DIRECTORY, STONE_LIGHT_PATH))
      ? await readWorldData<Record<string, StoneLight>>(STONE_LIGHT_PATH)
      : {};
    const heightDarkening =
      args.darkening === undefined
        ? ((typeof timeOfDay === "string" ? lights[timeOfDay]?.heightDarkening : undefined) ?? 0)
        : Number(args.darkening);
    if (!Number.isFinite(heightDarkening))
      throw new InvalidOperationError(Operation.Read, "darkening", `${args.darkening} is not a number`);
    const { count, deviation, light, residual } = await solveReferenceStoneLight(
      args.reference,
      args.witness,
      args.self,
      heightDarkening,
    );
    console.log(`${count} pixels, residual ${residual.toFixed(4)} against the bins' spread ${deviation.toFixed(4)}`);
    console.log("ramp, dark end to lit end:");
    for (const knot of light.ramp) console.log(`  ${formatColor(knot)}`);
    console.log("harmonics:");
    for (const term of light.harmonics) console.log(`  ${formatColor(term)}`);
    console.log(`fading with height: ${formatColor(light.heightFade)}, darkening ${light.heightDarkening} a metre up`);
    console.log(
      `haze over the stone: ${formatColor(light.hazeColor)}, toward the sun ${formatColor(light.hazeScatterColor)}`,
    );
    if (!args.self && !args.write) return;
    if (typeof timeOfDay !== "string")
      throw new InvalidOperationError(Operation.Read, STONE_LIGHT_PATH, `${args.reference} sets no time of day`);
    if (args.self) {
      const written = lights[timeOfDay];
      if (!written)
        throw new InvalidOperationError(Operation.Read, STONE_LIGHT_PATH, `no light written for ${timeOfDay}`);
      // Every colour channel of the written light beside the one solved for it, knot by knot and term by term
      const pairs = [
        { set: written.ramp, solved: light.ramp },
        { set: written.harmonics, solved: light.harmonics },
        { set: [written.heightFade], solved: [light.heightFade] },
        { set: [written.hazeColor, written.hazeScatterColor], solved: [light.hazeColor, light.hazeScatterColor] },
      ].flatMap(({ set, solved }) =>
        set.flatMap((colors, index) =>
          colors.map((value, channel) => ({ solved: solved[index]?.[channel] ?? 0, value })),
        ),
      );
      const pairCount = Math.max(pairs.length, 1);
      const scale = Math.sqrt(pairs.reduce((sum, { value }) => sum + value ** 2, 0) / pairCount);
      const error = Math.sqrt(pairs.reduce((sum, { solved, value }) => sum + (solved - value) ** 2, 0) / pairCount);
      console.log(`against the light written for ${timeOfDay}: ${error.toFixed(4)} off over its ${scale.toFixed(4)}`);
      return;
    }
    lights[timeOfDay] = {
      harmonics: light.harmonics.map(roundColor),
      hazeColor: roundColor(light.hazeColor),
      hazeScatterColor: roundColor(light.hazeScatterColor),
      heightDarkening: light.heightDarkening,
      heightFade: roundColor(light.heightFade),
      ramp: light.ramp.map(roundColor),
    };
    console.log(await writeWorldData(STONE_LIGHT_PATH, lights));
  },
});
