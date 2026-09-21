import type { SpeakerTensors } from "@esposter/genshin-persona/src/models/SpeakerTensors.ts";
import type { VoiceSynthesizer } from "@esposter/genshin-persona/src/models/VoiceSynthesizer.ts";

import { MODELS_DIRECTORY } from "#src/services/voiceMatch/constants";
import { PersonaReferenceMap } from "@esposter/genshin-persona/src/generated/PersonaReferenceMap.ts";
import { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";
import { createClipDecoder } from "@esposter/genshin-persona/src/services/createClipDecoder.ts";
import { createVoiceSynthesizer } from "@esposter/genshin-persona/src/services/createVoiceSynthesizer.ts";
import { readReferenceClip } from "@esposter/genshin-persona/src/services/readReferenceClip.ts";
import { readVoiceDevice } from "@esposter/genshin-persona/src/services/readVoiceDevice.ts";
import { readVoiceRuntime } from "@esposter/genshin-persona/src/services/readVoiceRuntime.ts";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { assert, beforeAll, describe, test } from "vitest";

// The plugin's synthesizer timed through the runner's own copy of the engine's runtime, which is why the bench
// Lives here rather than beside the unit: the plugin never declares the runtime, for the reason the reference
// Selection lives in `scripts` (/docs/infra/claude-interface/reference-selection). What it measures is the host —
// The GPU's driver and the CPU's cores — over the engine's weights, so it is off once its numbers are committed and
// Flipped on when the engine, its variants or the device ladder change: set `IS_ENABLED`, point
// "VOICE_MATCH_MODELS_DIRECTORY" at weights already fetched, run `pnpm bench` in this package, commit the artifact,
// Flip it back — with no resident synthesizer speaking, since the two share the GPU and every core and a reply read
// Under a run spreads its samples wider than any regression. A CI runner has neither the weights nor a GPU, so it
// Skips there whatever the switch says
const IS_CI = Boolean(process.env.CI);
const IS_ENABLED = false;
const isBenchable = IS_ENABLED && !IS_CI;
// One roster character with a measured reference, read in the English dub from the plugin's own cache so the bench
// Speaks from exactly what a reply does; the sentences are three shapes a reply's prose takes, each read whole
const CHARACTER_NAME = "Aino";
const SENTENCES = {
  long: "Every problem is a machine to rebuild better, so I took the whole engine apart on the bench, laid every gear out in a row, and found the one that was grinding against the reference clip the whole time.",
  medium: "The vocoder runs on the processor on this rung, and every unit pays for it before a sound is heard.",
  short: "Ooh, a new project? Hand me a wrench.",
};

describe.skipIf(!isBenchable)("synthesizer", () => {
  let synthesizer: VoiceSynthesizer;
  let speaker: SpeakerTensors;

  beforeAll(async () => {
    const decoder = await createClipDecoder();
    const stem = PersonaReferenceMap[CHARACTER_NAME]?.stem ?? "";
    const clip = await readReferenceClip(CHARACTER_NAME, stem, VoiceLanguage.English, decoder);
    decoder.free();
    assert.exists(clip);

    // The rung the plugin last spoke on, where a reply starts too; a machine with none walks the ladder from the top
    synthesizer = await createVoiceSynthesizer(readVoiceRuntime(import.meta.url), MODELS_DIRECTORY, {
      rungName: readVoiceDevice(),
    });
    speaker = await synthesizer.encodeReference(clip);
  });

  // `vs base` reads the short sentence against the others: the language model's cost grows with the tokens it
  // Makes, the vocoder's with those plus the reference's, so the short sentence carries the largest fixed share
  test("synthesize - sentence shapes", async ({ bench }) => {
    await bench.compare(
      ...Object.entries(SENTENCES).map(([shape, sentence]) =>
        bench(shape, async () => {
          await synthesizer.synthesize(sentence, speaker);
        }),
      ),
      // A synthesis is tens of seconds here, so the shared counts would run this bench for an hour; one warmup pays
      // The graph's first-call cost, which a reply never sees because the warm request paid it
      { ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 1 },
    );
  });
});
