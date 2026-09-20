import type { SpeechVoice } from "#src/models/SpeechVoice";

import { MICROSOFT_SPEECH_NAMESPACE } from "#src/services/constants";
import { getSsml } from "#src/services/getSsml";
import { describe, expect, test } from "vitest";

describe(getSsml, () => {
  // The name is read by its shape: the markup is spoken under the locale its first two segments spell
  const name = "a-b-c";
  const voice: SpeechVoice = { name };

  test("wraps the escaped text in the voice under the locale the name spells", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "&", voice, volume: "" })).toBe(
      `<speak version="1.0" xml:lang="a-b"><voice name="${name}">&amp;</voice></speak>`,
    );
  });

  test("carries the pitch, the rate and the volume as one prosody, each adjustment signed", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "", voice: { ...voice, pitch: -1, rate: 1 }, volume: "volume" })).toBe(
      `<speak version="1.0" xml:lang="a-b"><voice name="${name}"><prosody pitch="-1%" rate="+1%" volume="volume"></prosody></voice></speak>`,
    );
  });

  test("leaves out an adjustment the card did not make, so the voice keeps its own", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "", voice: { ...voice, rate: 1 }, volume: "" })).toBe(
      `<speak version="1.0" xml:lang="a-b"><voice name="${name}"><prosody rate="+1%"></prosody></voice></speak>`,
    );
  });

  test("declares the style namespace only for a voice that names a style", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "", voice: { ...voice, style: "style", styleDegree: 1 }, volume: "" })).toBe(
      `<speak version="1.0" xmlns:mstts="${MICROSOFT_SPEECH_NAMESPACE}" xml:lang="a-b"><voice name="${name}"><mstts:express-as style="style" styledegree="1"></mstts:express-as></voice></speak>`,
    );
  });

  test("nests the prosody inside the style, which is the order the service reads them in", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "", voice: { ...voice, rate: 1, style: "style" }, volume: "" })).toBe(
      `<speak version="1.0" xmlns:mstts="${MICROSOFT_SPEECH_NAMESPACE}" xml:lang="a-b"><voice name="${name}"><mstts:express-as style="style"><prosody rate="+1%"></prosody></mstts:express-as></voice></speak>`,
    );
  });
});
