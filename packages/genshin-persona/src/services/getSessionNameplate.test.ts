import type { Nameplate } from "#src/models/Nameplate";
import type { PickRecord } from "#src/models/PickRecord";

import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { createCharacter } from "#src/services/createCharacter.test";
import { getSessionNameplate } from "#src/services/getSessionNameplate";
import { describe, expect, test } from "vitest";

describe(getSessionNameplate, () => {
  const sessionId = "sessionId";
  const todayIsoDate = TEST_EPOCH_DATE.toString();
  const pickRecord: PickRecord = {
    displayName: "pickRecord",
    element: "",
    isoDate: todayIsoDate,
    name: "pickRecord",
    sessionId,
  };
  const pin: Nameplate = { displayName: "pin", element: "", name: "pin" };
  const birthdayCharacter = createCharacter({
    birthday: "1/1",
    displayName: "birthdayCharacter",
    name: "birthdayCharacter",
  });
  const roster = [birthdayCharacter];

  test("names the session's own record over the pin and the pick", () => {
    expect.hasAssertions();

    expect(getSessionNameplate([pickRecord], pin, roster, sessionId, TEST_EPOCH_DATE)).toStrictEqual(pickRecord);
  });

  test("names the pin over the pick for a session with no record", () => {
    expect.hasAssertions();

    expect(getSessionNameplate([], pin, roster, sessionId, TEST_EPOCH_DATE)).toStrictEqual(pin);
  });

  test("names the birthday pick, never another session's record, for a session with no record and no pin", () => {
    expect.hasAssertions();

    const otherSessionRecord: PickRecord = { ...pickRecord, sessionId: " " };

    expect(getSessionNameplate([otherSessionRecord], undefined, roster, sessionId, TEST_EPOCH_DATE)).toStrictEqual(
      birthdayCharacter,
    );
  });

  test("names nobody when there is no record, no pin and no roster", () => {
    expect.hasAssertions();

    expect(getSessionNameplate([], undefined, [], sessionId, TEST_EPOCH_DATE)).toBeUndefined();
  });
});
