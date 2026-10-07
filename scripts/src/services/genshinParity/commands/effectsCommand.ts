import type { SubCommandsDef } from "citty";
import type { SoundEffect } from "genshin-engine";

import { LOGIN_DOOR_SOUNDS, MINIMUM_PACKAGE_NAME } from "#src/services/genshinAssets/shared/constants";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { readGameSoundEffect } from "#src/services/genshinAssets/sound/readGameSoundEffect";
import { scoreSoundEffect } from "#src/services/genshinParity/sound/scoreSoundEffect";
import { defineCommand } from "citty";
import { SOUND_EFFECT_BAND_EDGES } from "genshin-engine";

export const effectsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Score each of the login's sound effects as the engine plays it against the game's own sounds it was fitted from: both channels' mean gap over the effect's bands every 5 ms, each band's bias, and how alike the two channels sound",
    name: "effects",
  },
  run: async () => {
    const { door } = await readWorldData<{ door: SoundEffect }>("login/sounds.json");
    const { bandBiases, correlation, distance } = scoreSoundEffect(
      door,
      await readGameSoundEffect(MINIMUM_PACKAGE_NAME, LOGIN_DOOR_SOUNDS),
    );
    console.log(
      `door: ${distance.toFixed(2)} dB, channels correlated ${correlation.ours.toFixed(2)} against the game's ${correlation.game.toFixed(2)}`,
    );
    console.log(
      `  band biases: ${bandBiases.map((bias, band) => `${SOUND_EFFECT_BAND_EDGES[band]}–${SOUND_EFFECT_BAND_EDGES[band + 1]} Hz ${bias.toFixed(1)}`).join(", ")}`,
    );
  },
});
