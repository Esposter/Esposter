import type { SpeechVoice } from "#src/models/SpeechVoice";

import { MICROSOFT_SPEECH_NAMESPACE } from "#src/services/constants";
import { getSsml } from "#src/services/getSsml";
import { describe, expect, test } from "vitest";

describe(getSsml, () => {
  // The name is read by its shape: the markup is spoken under the locale its first two segments spell
  const name = "a-b-c";
  const voice: SpeechVoice = { name, pitch: "", rate: "", style: "", styleDegree: "" };

  test("wraps the escaped text in the voice under the locale the name spells", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "&", voice, volume: "" })).toBe(
      `<speak version="1.0" xml:lang="a-b"><voice name="${name}">&amp;</voice></speak>`,
    );
  });

  test("carries the pitch, the rate and the volume as one prosody", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "", voice: { ...voice, pitch: "pitch", rate: "rate" }, volume: "volume" })).toBe(
      `<speak version="1.0" xml:lang="a-b"><voice name="${name}"><prosody pitch="pitch" rate="rate" volume="volume"></prosody></voice></speak>`,
    );
  });

  test("declares the style namespace only for a voice that names a style", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "", voice: { ...voice, style: "style", styleDegree: "styleDegree" }, volume: "" })).toBe(
      `<speak version="1.0" xmlns:mstts="${MICROSOFT_SPEECH_NAMESPACE}" xml:lang="a-b"><voice name="${name}"><mstts:express-as style="style" styledegree="styleDegree"></mstts:express-as></voice></speak>`,
    );
  });

  test("nests the prosody inside the style, which is the order the service reads them in", () => {
    expect.hasAssertions();

    expect(getSsml({ text: "", voice: { ...voice, rate: "rate", style: "style" }, volume: "" })).toBe(
      `<speak version="1.0" xmlns:mstts="${MICROSOFT_SPEECH_NAMESPACE}" xml:lang="a-b"><voice name="${name}"><mstts:express-as style="style"><prosody rate="rate"></prosody></mstts:express-as></voice></speak>`,
    );
  });
});
