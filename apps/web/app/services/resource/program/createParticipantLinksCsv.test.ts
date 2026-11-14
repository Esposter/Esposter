import { createParticipantLinksCsv } from "@/services/resource/program/createParticipantLinksCsv";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createParticipantLinksCsv, () => {
  const keyColumn = "email";
  const surveyId = v7();
  const token = v7();
  const origin = "https://esposter.com";

  test("pairs each key value with its tokened survey link", () => {
    expect.hasAssertions();

    expect(createParticipantLinksCsv(keyColumn, surveyId, [{ keyValue: "a", token }], origin)).toBe(
      `email,Link\na,${origin}/view/Survey/${surveyId}?t=${token}`,
    );
  });

  test("neutralises a key value a spreadsheet would run as a formula", () => {
    expect.hasAssertions();

    expect(createParticipantLinksCsv(keyColumn, surveyId, [{ keyValue: "=1", token }], origin)).toBe(
      `email,Link\n"\t=1",${origin}/view/Survey/${surveyId}?t=${token}`,
    );
  });
});
