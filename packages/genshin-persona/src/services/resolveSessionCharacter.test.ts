import type { Character } from "#src/models/Character";
import type { PickRecord } from "#src/models/PickRecord";
import type { Today } from "#src/models/Today";
import type { pickCurrentCharacter as basePickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import type { readPickRecords as baseReadPickRecords } from "#src/services/readPickRecords";
import type { readPin as baseReadPin } from "#src/services/readPin";
import type { writePickRecords as baseWritePickRecords } from "#src/services/writePickRecords";

import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { pickCurrentCharacter, readPickRecords, readPin, writePickRecords } = vi.hoisted(() => ({
  pickCurrentCharacter: vi.fn<typeof basePickCurrentCharacter>(),
  readPickRecords: vi.fn<typeof baseReadPickRecords>(),
  readPin: vi.fn<typeof baseReadPin>(),
  writePickRecords: vi.fn<typeof baseWritePickRecords>(),
}));

// The state file stands in as an array every double reads and writes, which is what lets a second session write
// Into it while this one waits on its pick; the pick itself is the network the wait is on
vi.mock(import("#src/services/readPickRecords"), () => ({
  readPickRecords: readPickRecords as unknown as typeof baseReadPickRecords,
}));

vi.mock(import("#src/services/writePickRecords"), () => ({
  writePickRecords: writePickRecords as unknown as typeof baseWritePickRecords,
}));

vi.mock(import("#src/services/readPin"), () => ({ readPin: readPin as unknown as typeof baseReadPin }));

vi.mock(import("#src/services/pickCurrentCharacter"), () => ({
  pickCurrentCharacter: pickCurrentCharacter as unknown as typeof basePickCurrentCharacter,
}));

describe(resolveSessionCharacter, () => {
  const sessionId = "sessionId";
  const today: Today = { isoDate: "1970-01-01", monthDay: { day: 1, month: 1 } };
  const character: Character = {
    birthday: "7/15",
    description: "",
    element: "Pyro",
    name: "Hu Tao",
    region: "",
    title: "",
    version: "",
  };
  const otherRecord: PickRecord = {
    element: "Anemo",
    isoDate: today.isoDate,
    name: "Venti",
    sessionId: "otherSessionId",
  };
  let pickRecords: PickRecord[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    pickRecords = [];
    readPickRecords.mockImplementation(() => [...pickRecords]);
    writePickRecords.mockImplementation((records) => {
      pickRecords = [...records];
    });
    readPin.mockReturnValue(undefined);
  });

  test("keeps the record a session that started alongside it wrote while its own pick was in flight", async () => {
    expect.hasAssertions();

    pickCurrentCharacter.mockImplementation(() => {
      writePickRecords([...pickRecords, otherRecord]);
      return Promise.resolve(character);
    });

    await expect(resolveSessionCharacter([character], sessionId, today)).resolves.toStrictEqual(character);
    expect(pickRecords).toStrictEqual([
      otherRecord,
      { element: character.element, isoDate: today.isoDate, name: character.name, sessionId },
    ]);
  });
});
