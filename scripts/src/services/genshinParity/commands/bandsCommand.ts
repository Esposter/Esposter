import type { ComponentPlaylist } from "#src/models/genshinAssets/ComponentPlaylist";
import type { SubCommandsDef } from "citty";
import type { Music } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readWorldData } from "#src/services/genshinAssets/readWorldData";
import { characterizeMusicBands } from "#src/services/genshinParity/characterizeMusicBands";
import { LISTEN_BAND_CENTRES, LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/constants";
import { readGameMusicSegment } from "#src/services/genshinParity/readGameMusicSegment";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { defineCommand } from "citty";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const bandsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "What each octave band of the game's login music holds, segment by segment: its share of the sound, its flatness, its weight at the attacks and the share of it on a partial of the notes we play",
    name: "bands",
  },
  run: async () => {
    const { music: directory } = getComponentDirectory(DerivedAssetComponent.Login);
    const { segments } = parseMachineJson<ComponentPlaylist>(await readFile(join(directory, "playlist.json"), "utf8"));
    const music = await readWorldData<Music>("login/music.json");
    for (const [index, segment] of segments.entries()) {
      if (segment.clips.length === 0) continue;
      // oxlint-disable-next-line no-await-in-loop -- one segment's sound is held at a time
      const game = await readGameMusicSegment(directory, segment, LISTEN_SAMPLE_RATE);
      const notes = music.segments[index]?.voices.flatMap((voice) => voice.notes) ?? [];
      console.log(`segment ${segment.id}: band, share of the sound, flatness, weight at attacks, share on partials`);
      for (const [band, { attackWeight, flatness, partialShare, share }] of characterizeMusicBands(
        game,
        LISTEN_SAMPLE_RATE,
        notes,
      ).entries())
        console.log(
          `  ${LISTEN_BAND_CENTRES[band]} Hz: ${share.toFixed(1)} dB, ${flatness.toFixed(3)}, ${attackWeight.toFixed(1)} dB, ${partialShare.toFixed(2)}`,
        );
    }
  },
});
