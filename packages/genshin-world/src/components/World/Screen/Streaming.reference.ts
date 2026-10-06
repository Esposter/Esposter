import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// What the tile streams round the statue: the asset index, the StreamGen records and the prefabs they name
export const streamingTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "AnimeStudio's --ai_file option traced to radioegor146/gi-asset-indexes, its last full index fetched and its paths under Build/LevelStreaming listed for the tile",
      outcome: InvestigationOutcome.Found,
      result:
        "The game's own asset index of version 2.6, as the community publishes it, names every streamed asset of the open world by path: per tile a StreamGen blob and its index, per-layer chunks, HLODs, water and fog tiles, reflection probes and its terrain as TerrainData_Final/…/BigWorldTerrain_1_-2.bin. AnimeStudio names a MiHoYoBinData by its path's PathHashLast in hex, so a blob is found by its path",
    },
    {
      method:
        "Records near the statue read by hand, their masks compared across five kinds until every field held one bit, then the grammar run over every chunk of the tile's blob at its index's offsets",
      outcome: InvestigationOutcome.Found,
      result:
        "A StreamGen blob is a length word and chunks at its index's offsets; a chunk is a varint mask, an id, a count and that many records, and a record a varint mask whose bits, in order, carry flags, its prefab's 64-bit path hash, the world's 32-bit id for the prefab, a streaming radius, its position, its Euler rotation in degrees, its scale (each vector led by a byte of which components follow), an instance, a parent and a flag. Every chunk but the tile's last two parses to its next one's offset, about sixteen thousand placements",
    },
    {
      method:
        "Every placement's 64-bit hash looked up in the 2.6 index; CRC32, FNV-1 and FNV-1a, Java's, MD5's and SHA-1's low words over each named path's spellings tested against its 32-bit id; GlobalFinMap read for both",
      outcome: InvestigationOutcome.Found,
      result:
        "A 64-bit path hash is the asset index's PathHashPre in its low byte and PathHashLast in the four above, so it names its prefab's _Vo path; through it about half the placements round the statue are named, the ruins, rocks, grass and decals. The 32-bit id is no hash of any path spelling, and GlobalFinMap's keys are path hashes with no 32-bit id at a fixed offset from them",
    },
    {
      method:
        "The two ruins' prefabs added to the tile's stream and drawn in the witness beside the recording, then every ruin prefab of their block exported and measured against the pedestals' size",
      outcome: InvestigationOutcome.Found,
      result:
        "Area_Common_Build_Ruin_H_06_Vo and _07_Vo, the two placements nearest the statue's dais, are irregular paving stones about a metre and a half across that sit under the recordings' dais steps, not pedestals. The carved pedestals about ten metres either side of the statue, turned a quarter, are the near-equal world ids 2068796237 and 2068799372 with a streaming radius of 4.3 and no path hash; they are none of the ruin block's Ruin_H_01 to _05 (rubble), _08, _10, _12, or Ruin_Platform_01 and _04 (42 and 21 metres across)",
    },
    {
      method:
        "Both paving stones' ids tested against each polynomial hash over every spelling of their names and paths",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "No hash of a name gives the world's 32-bit id: sibling ids often differ by 961, thirty-one squared, yet base-31, 33, 37, 131, 65599 and FNV polynomial hashes of the names, lowercase, with .prefab and as paths, match neither paving stone's id",
    },
  ],
  openQuestions: [
    "The prefabs of the placements carrying only the world's 32-bit id, the trees round the statue among them, the dais under the statue, the carved pedestals beside it, and the paths newer than the 2.6 index",
  ],
};
