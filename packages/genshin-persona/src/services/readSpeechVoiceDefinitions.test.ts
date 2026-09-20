import { readSpeechVoiceDefinitions } from "#src/services/readSpeechVoiceDefinitions";
import { afterEach, describe, expect, test, vi } from "vitest";

const stubCatalogue = (body: unknown) => {
  vi.stubGlobal("fetch", () => Promise.resolve(Response.json(body)));
};

describe(readSpeechVoiceDefinitions, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("reads every voice the catalogue lists", async () => {
    expect.hasAssertions();

    stubCatalogue([{ ShortName: "en-AU-NatashaNeural", StyleList: ["cheerful"] }, { ShortName: "en-AU-CarlyNeural" }]);

    await expect(readSpeechVoiceDefinitions("https://endpoint", "key")).resolves.toStrictEqual([
      { name: "en-AU-NatashaNeural", styles: ["cheerful"] },
      { name: "en-AU-CarlyNeural", styles: [] },
    ]);
  });

  // The command has a sentence for a catalogue it could not read, so nothing in the body is walked before its shape
  // Is known — a list of anything but entries used to throw out of the command instead
  test("drops a listed entry that is not one", async () => {
    expect.hasAssertions();

    stubCatalogue([null, "en-AU-NatashaNeural", { ShortName: "en-AU-CarlyNeural", StyleList: "cheerful" }]);

    await expect(readSpeechVoiceDefinitions("https://endpoint", "key")).resolves.toStrictEqual([
      { name: "en-AU-CarlyNeural", styles: [] },
    ]);
  });

  // The list is narrowed to objects and no further, so a field's own type is established here rather than promised
  // By the entry interface
  test("drops a voice whose name is not one, and keeps only the styles that are strings", async () => {
    expect.hasAssertions();

    stubCatalogue([
      { ShortName: 7, StyleList: ["cheerful"] },
      { ShortName: "en-AU-CarlyNeural", StyleList: ["cheerful", 7, null] },
    ]);

    await expect(readSpeechVoiceDefinitions("https://endpoint", "key")).resolves.toStrictEqual([
      { name: "en-AU-CarlyNeural", styles: ["cheerful"] },
    ]);
  });

  test("is nothing for a body that is not a list at all", async () => {
    expect.hasAssertions();

    stubCatalogue({ error: "the key is not this resource's" });

    await expect(readSpeechVoiceDefinitions("https://endpoint", "key")).resolves.toBeUndefined();
  });
});
