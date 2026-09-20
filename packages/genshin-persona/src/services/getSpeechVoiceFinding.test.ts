import type { SpeechVoiceDefinition } from "#src/models/SpeechVoiceDefinition";

import { getSpeechVoiceFinding } from "#src/services/getSpeechVoiceFinding";
import { parseSpeechVoice } from "#src/services/parseSpeechVoice";
import { describe, expect, test } from "vitest";

describe(getSpeechVoiceFinding, () => {
  const name = "a";
  const style = "style";
  const styled: SpeechVoiceDefinition = { name, styles: [style] };
  const plain: SpeechVoiceDefinition = { name, styles: [] };

  test("says nothing about a voice the resource has, asked for no style", () => {
    expect.hasAssertions();

    expect(getSpeechVoiceFinding(parseSpeechVoice(name), [plain])).toBe("");
  });

  test("says nothing about a style the voice declares", () => {
    expect.hasAssertions();

    expect(getSpeechVoiceFinding(parseSpeechVoice(`${name} style=${style}`), [styled])).toBe("");
  });

  test("reports a voice the resource does not have", () => {
    expect.hasAssertions();

    expect(getSpeechVoiceFinding(parseSpeechVoice(" "), [plain])).toMatchInlineSnapshot(
      `"names no voice this resource has: "`,
    );
  });

  test("reports a style the voice does not declare, and lists the ones it does", () => {
    expect.hasAssertions();

    expect(getSpeechVoiceFinding(parseSpeechVoice(`${name} style=b`), [styled])).toMatchInlineSnapshot(
      `"asks for the style "b", which a does not declare; it has style"`,
    );
  });

  test("reports a style asked of a voice that declares none", () => {
    expect.hasAssertions();

    expect(getSpeechVoiceFinding(parseSpeechVoice(`${name} style=${style}`), [plain])).toMatchInlineSnapshot(
      `"asks for the style "style", and a declares no styles at all"`,
    );
  });
});
