import { parseGenshinJournal } from "@/services/genshin/parseGenshinJournal";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(parseGenshinJournal, () => {
  const SESSION_ID = v7();

  test("reads back the journal a page wrote, its instants still ISO strings", () => {
    expect.hasAssertions();

    const journalJson = JSON.stringify({ save: EMPTY_GENSHIN_SAVE, sessionId: SESSION_ID });
    expect(parseGenshinJournal(journalJson)).toStrictEqual({ save: EMPTY_GENSHIN_SAVE, sessionId: SESSION_ID });
  });

  test("reads as none a journal that is absent, does not parse, or holds a save the schema refuses", () => {
    expect.hasAssertions();

    expect(parseGenshinJournal(null)).toBeUndefined();
    expect(parseGenshinJournal("not json")).toBeUndefined();
    expect(parseGenshinJournal(JSON.stringify({ save: {}, sessionId: SESSION_ID }))).toBeUndefined();
  });
});
