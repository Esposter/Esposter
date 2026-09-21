import type { Character } from "#src/models/Character";

import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { pickCharacter } from "#src/services/pickCharacter";
import { describe, expect, test } from "vitest";

const createCharacter = (birthday: string): Character => ({
  affiliation: "",
  birthday,
  constellation: "",
  description: "",
  displayElement: "",
  displayName: birthday,
  element: "",
  name: birthday,
  region: "",
  title: "",
  version: "",
  weapon: "",
});

describe(pickCharacter, () => {
  const epoch = TEST_EPOCH_DATE;

  test("picks the nearest birthday by circular distance, so late December neighbours early January", () => {
    expect.hasAssertions();

    const roster = [createCharacter("12/30"), createCharacter("1/4"), createCharacter("6/1")];

    expect(pickCharacter(roster, epoch)).toStrictEqual(createCharacter("12/30"));
  });

  test("prefers the upcoming birthday over the one just passed at the same distance", () => {
    expect.hasAssertions();

    const roster = [createCharacter("12/31"), createCharacter("1/2")];

    expect(pickCharacter(roster, epoch)).toStrictEqual(createCharacter("1/2"));
  });

  test("picks a birthday today over one at any distance", () => {
    expect.hasAssertions();

    const roster = [createCharacter("1/2"), createCharacter("1/1")];

    expect(pickCharacter(roster, epoch)).toStrictEqual(createCharacter("1/1"));
  });

  test("breaks a remaining tie by the date, identically for the same date", () => {
    expect.hasAssertions();

    const roster = [createCharacter("1/1"), { ...createCharacter("1/1"), name: " " }];
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

    const roster = [createCharacter("2/29"), createCharacter("3/3")];

    expect(pickCharacter(roster, epoch.with({ day: 1, month: 3 }))).toStrictEqual(createCharacter("2/29"));
  });

  test("never picks a character without a birthday, and picks nobody when none has one", () => {
    expect.hasAssertions();

    const traveler = createCharacter("");

    expect(pickCharacter([traveler, createCharacter("7/1")], epoch)).toStrictEqual(createCharacter("7/1"));
    expect(pickCharacter([traveler], epoch)).toBeUndefined();
  });
});
