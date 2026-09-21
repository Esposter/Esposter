import type { PickRecord } from "#src/models/PickRecord";
import type { pickCurrentCharacter as basePickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import type { readPickRecords as baseReadPickRecords } from "#src/services/readPickRecords";
import type { readPin as baseReadPin } from "#src/services/readPin";
import type { writePickRecords as baseWritePickRecords } from "#src/services/writePickRecords";

import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { createCharacter } from "#src/services/createCharacter.test";
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
vi.mock(import("#src/services/readPickRecords"), () => ({ readPickRecords }));

vi.mock(import("#src/services/writePickRecords"), () => ({ writePickRecords }));

vi.mock(import("#src/services/readPin"), () => ({ readPin }));

vi.mock(import("#src/services/pickCurrentCharacter"), () => ({ pickCurrentCharacter }));

describe(resolveSessionCharacter, () => {
  const sessionId = "sessionId";
  // The three fields the record is written from
  const character = createCharacter({ displayName: "displayName", element: "element", name: "name" });
  const otherRecord: PickRecord = {
    displayName: " ",
    element: " ",
    isoDate: TEST_EPOCH_DATE.toString(),
    name: " ",
    sessionId: " ",
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

    await expect(resolveSessionCharacter([character], sessionId, TEST_EPOCH_DATE)).resolves.toStrictEqual(character);
    expect(pickRecords).toStrictEqual([
      otherRecord,
      {
        displayName: character.displayName,
        element: character.element,
        isoDate: TEST_EPOCH_DATE.toString(),
        name: character.name,
        sessionId,
      },
    ]);
  });
});
