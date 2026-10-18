import type { TrialTemplate } from "#src/models/trial/TrialTemplate";

import { findTrialTemplate } from "#src/services/trial/findTrialTemplate";
import { describe, expect, test } from "vitest";

const TEMPLATES: TrialTemplate[] = [
  { level: 1, reliquaryIds: [1, 2], talentLevel: 1 },
  { level: 10, reliquaryIds: [11, 12, 13, 14, 15], talentLevel: 1 },
  { level: 85, reliquaryIds: [91, 92, 93, 94, 95], talentLevel: 8 },
];

describe(findTrialTemplate, () => {
  test("a trial takes its talent level and artifacts from the highest template at or below its level", () => {
    expect.hasAssertions();
    expect(findTrialTemplate(TEMPLATES, 85)).toStrictEqual(TEMPLATES[2]);
    expect(findTrialTemplate(TEMPLATES, 90)).toStrictEqual(TEMPLATES[2]);
    expect(findTrialTemplate(TEMPLATES, 9)).toStrictEqual(TEMPLATES[0]);
  });

  test("a trial below every template has none", () => {
    expect.hasAssertions();
    expect(findTrialTemplate(TEMPLATES, 0)).toBeUndefined();
  });
});
