import { checkContainsProfanity } from "#src/services/profanity/checkContainsProfanity";
import { describe, expect, test } from "vitest";

describe(checkContainsProfanity, () => {
  test("finds a whole profane word in a sentence", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("I like big butts and I cannot lie")).toBe(true);
    expect(checkContainsProfanity("Don't be a butt.")).toBe(true);
    expect(checkContainsProfanity("Butt is a profane word")).toBe(true);
  });

  test("finds a profane word on any line of a multi-line text", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("Nothing here.\nCensoring butt on line 2.\nNothing here.")).toBe(true);
  });

  test("finds a profane word that punctuation, a hyphen, an underscore or an emoji surrounds", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("What the (butt)!")).toBe(true);
    expect(checkContainsProfanity("Don't be a butt-head")).toBe(true);
    expect(checkContainsProfanity("Don't be a head-butt")).toBe(true);
    expect(checkContainsProfanity("Don't be a butt_face")).toBe(true);
    expect(checkContainsProfanity("Don't be a face_butt")).toBe(true);
    expect(checkContainsProfanity("That's 💩butt💩")).toBe(true);
  });

  test("finds a multi-word profanity", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("He's a fudge packer")).toBe(true);
    expect(checkContainsProfanity("That's a blow job")).toBe(true);
    expect(checkContainsProfanity("Don't be a son-of-a-bitch")).toBe(true);
  });

  test("ignores a profane word that is part of a larger word", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("I need to assess the situation")).toBe(false);
    expect(checkContainsProfanity("I'm feeling passionate today")).toBe(false);
    expect(checkContainsProfanity("Should we censor the word arsenic?")).toBe(false);
    expect(checkContainsProfanity("Don't be an arsenic-head")).toBe(false);
    expect(checkContainsProfanity("Don't be a head_arsenic")).toBe(false);
  });

  test("ignores a multi-word profanity whose words are split", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("I like to pack fudge for desserts")).toBe(false);
    expect(checkContainsProfanity("The wind blew jobs away")).toBe(false);
  });

  test("ignores a profane word inside a URL that is part of a larger word", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("Visit https://www.example.com/assets/image.jpg")).toBe(false);
  });

  test("matches regardless of case", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("Don't be a BuTt")).toBe(true);
    expect(checkContainsProfanity("DON'T BE A BUTT")).toBe(true);
    expect(checkContainsProfanity("dOn'T bE a BuTt")).toBe(true);
  });

  test("#76 returns false for a non-string input instead of throwing", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity(null)).toBe(false);
    expect(checkContainsProfanity(undefined)).toBe(false);
    expect(checkContainsProfanity(123)).toBe(false);
    expect(checkContainsProfanity({})).toBe(false);
    expect(checkContainsProfanity([])).toBe(false);
  });

  test("#18 #156 reads a profane word ending in a regex character as literal text", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("a$$", { isWholeWord: true })).toBe(true);
    expect(checkContainsProfanity("MPEUGNMA", { isWholeWord: false })).toBe(false);
    expect(checkContainsProfanity("FUNTIMESA", { isWholeWord: false })).toBe(false);
    expect(checkContainsProfanity("BUTTSA", { isWholeWord: false })).toBe(true);
    expect(checkContainsProfanity("lovea$$", { isWholeWord: false })).toBe(true);
  });

  test("#154 treats a letter with a diacritic or a combining mark as part of the word", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("butté")).toBe(false);
    expect(checkContainsProfanity("butt́")).toBe(false);
  });

  // Known false positives of the substring match (isWholeWord false), kept as the behaviour a caller asks for
  test("finds a profane word inside a larger word when isWholeWord is false", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("Should we censor the word arsenic?", { isWholeWord: false })).toBe(true);
    expect(checkContainsProfanity("I need to assess the situation", { isWholeWord: false })).toBe(true);
    expect(checkContainsProfanity("Massachusetts", { isWholeWord: false })).toBe(true);
    expect(checkContainsProfanity("buttress the wall", { isWholeWord: false })).toBe(true);
    expect(checkContainsProfanity("kickbutt performance", { isWholeWord: false })).toBe(true);
    expect(checkContainsProfanity("Scunthorpe", { isWholeWord: false })).toBe(true);
    // #40 `password` is censored by the `ass` inside it, and the whole-word match is the way out
    expect(checkContainsProfanity("dedicated password", { isWholeWord: false })).toBe(true);
    expect(checkContainsProfanity("dedicated password")).toBe(false);
  });

  // Upstream already passes this, so it pins the fix rather than reproducing it
  test("#41 does not find a name that merely contains a profane word, under whole-word matching", () => {
    expect.hasAssertions();

    expect(checkContainsProfanity("Massterly")).toBe(false);
  });
});
