import { getPersonaVoiceSource } from "#src/services/voiceMatch/rank/getPersonaVoiceSource";
import { describe, expect, test } from "vitest";

describe(getPersonaVoiceSource, () => {
  const name = "name";
  const voice = "voice";

  test("writes a module in the card's shape with only the adjustments that were made", () => {
    expect.hasAssertions();

    expect(getPersonaVoiceSource(name, { pitch: -1, rate: 0, score: 0, voice }))
      .toBe(`import type { SpeechVoice } from "#src/models/SpeechVoice";

const ${name}: SpeechVoice = { name: "${voice}", pitch: -1 };

export default ${name};
`);
  });

  // The name is the catalogue's, so a quote or a backslash in it would otherwise close or escape the literal the
  // Module is written with
  test("quotes a name that carries the literal's own punctuation", () => {
    expect.hasAssertions();

    const punctuatedVoice = String.raw`en-AU-"Carly\Neural`;

    expect(getPersonaVoiceSource(name, { pitch: 0, rate: 0, score: 0, voice: punctuatedVoice }))
      .toBe(String.raw`import type { SpeechVoice } from "#src/models/SpeechVoice";

const ${name}: SpeechVoice = { name: "en-AU-\"Carly\\Neural" };

export default ${name};
`);
  });
});
