import type { SubCommandsDef } from "citty";
import type { StoneLight } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { solveReferenceStoneLight } from "#src/services/genshinParity/witness/solveReferenceStoneLight";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The world data file each hour's stone light is written into, keyed by the hour
const STONE_LIGHT_PATH = "login/stoneLight.json";
// The decimals a written light keeps, past which its colours move nothing the screen shows
const LIGHT_DECIMALS = 4;
const formatColor = (color: readonly number[]): string => color.map((value) => value.toFixed(3)).join(" ");
const roundColors = (colors: readonly (readonly number[])[]): number[][] =>
  colors.map((color) => color.map((value) => Number(value.toFixed(LIGHT_DECIMALS))));

export const calibrateCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
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
      "Solve a reference's stone light as the game's deferred pass casts it, its toon ramp and its sky's harmonics under the scene's haze, by least squares over the witness's G-buffer, printing the residual against the bins' spread",
    name: "calibrate",
  },
  run: async ({ args }) => {
    const { count, deviation, light, residual } = await solveReferenceStoneLight(
      args.reference,
      args.witness,
      args.self,
    );
    console.log(`${count} pixels, residual ${residual.toFixed(4)} against the bins' spread ${deviation.toFixed(4)}`);
    console.log("ramp, dark end to lit end:");
    for (const knot of light.ramp) console.log(`  ${formatColor(knot)}`);
    console.log("harmonics:");
    for (const term of light.harmonics) console.log(`  ${formatColor(term)}`);
    if (!args.self && !args.write) return;
    const timeOfDay = ParityReferenceMap[args.reference]?.props?.timeOfDay;
    if (typeof timeOfDay !== "string")
      throw new InvalidOperationError(Operation.Read, STONE_LIGHT_PATH, `${args.reference} sets no time of day`);
    const lights = existsSync(join(WORLD_DATA_DIRECTORY, STONE_LIGHT_PATH))
      ? await readWorldData<Record<string, StoneLight>>(STONE_LIGHT_PATH)
      : {};
    if (args.self) {
      const written = lights[timeOfDay];
      if (!written)
        throw new InvalidOperationError(Operation.Read, STONE_LIGHT_PATH, `no light written for ${timeOfDay}`);
      // Every colour channel of the written light beside the one solved for it, knot by knot and term by term
      const pairs = [
        { set: written.ramp, solved: light.ramp },
        { set: written.harmonics, solved: light.harmonics },
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
    lights[timeOfDay] = { harmonics: roundColors(light.harmonics), ramp: roundColors(light.ramp) };
    console.log(await writeWorldData(STONE_LIGHT_PATH, lights));
  },
});
