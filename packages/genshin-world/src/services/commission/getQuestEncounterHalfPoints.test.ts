import { QuestKind } from "#src/models/quest/QuestKind";
import { getQuestEncounterHalfPoints } from "#src/services/commission/getQuestEncounterHalfPoints";
import { describe, expect, test } from "vitest";

describe(getQuestEncounterHalfPoints, () => {
  test("an Archon or Story quest earns four Encounter Points, and the other kinds earn none", () => {
    expect.hasAssertions();
    expect(getQuestEncounterHalfPoints(QuestKind.Archon)).toBe(8);
    expect(getQuestEncounterHalfPoints(QuestKind.Story)).toBe(8);
    expect(getQuestEncounterHalfPoints(QuestKind.World)).toBe(0);
    expect(getQuestEncounterHalfPoints(QuestKind.Event)).toBe(0);
    expect(getQuestEncounterHalfPoints(QuestKind.Commission)).toBe(0);
  });
});
