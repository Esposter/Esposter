import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { createCharacter } from "#src/services/createCharacter.test";
import { pickCharacter } from "#src/services/pickCharacter";
import { describe, expect, test } from "vitest";

// Named for the birthday, which is the one field the pick reads and the one the assertions tell them apart by
const createBirthdayCharacter = (birthday: string) =>
  createCharacter({ birthday, displayName: birthday, name: birthday });

describe(pickCharacter, () => {
  const epoch = TEST_EPOCH_DATE;

  test("picks the nearest birthday by circular distance, so late December neighbours early January", () => {
    expect.hasAssertions();

    const roster = [createBirthdayCharacter("12/30"), createBirthdayCharacter("1/4"), createBirthdayCharacter("1/5")];

    expect(pickCharacter(roster, epoch)).toStrictEqual(createBirthdayCharacter("12/30"));
  });

  test("prefers the upcoming birthday over the one just passed at the same distance", () => {
    expect.hasAssertions();

    const roster = [createBirthdayCharacter("12/31"), createBirthdayCharacter("1/2")];

    expect(pickCharacter(roster, epoch)).toStrictEqual(createBirthdayCharacter("1/2"));
  });

  test("picks a birthday today over one at any distance", () => {
    expect.hasAssertions();

    const roster = [createBirthdayCharacter("1/2"), createBirthdayCharacter("1/1")];

    expect(pickCharacter(roster, epoch)).toStrictEqual(createBirthdayCharacter("1/1"));
  });

  test("breaks a remaining tie by the date, identically for the same date", () => {
    expect.hasAssertions();

    const roster = [createBirthdayCharacter("1/1"), { ...createBirthdayCharacter("1/1"), name: " " }];
    const firstPick = pickCharacter(roster, epoch);
    // Two dates whose hashes differ in parity, so the two tied candidates are both reached
    const secondPick = pickCharacter(roster, epoch.add({ days: 1 }));

    expect(pickCharacter(roster, epoch)).toStrictEqual(firstPick);
    expect(
      [firstPick, secondPick].map((character) => character?.name ?? "").toSorted((a, b) => a.localeCompare(b)),
    ).toStrictEqual([" ", "1/1"]);
  });

  test("measures 29 February like any other day", () => {
    expect.hasAssertions();

    const roster = [createBirthdayCharacter("2/29"), createBirthdayCharacter("3/3")];

    expect(pickCharacter(roster, epoch.with({ day: 1, month: 3 }))).toStrictEqual(createBirthdayCharacter("2/29"));
  });

  test("never picks a character without a birthday, and picks nobody when none has one", () => {
    expect.hasAssertions();

    const traveler = createBirthdayCharacter("");

    expect(pickCharacter([traveler, createBirthdayCharacter("1/2")], epoch)).toStrictEqual(
      createBirthdayCharacter("1/2"),
    );
    expect(pickCharacter([traveler], epoch)).toBeUndefined();
  });
});
