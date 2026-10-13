import { createProgramInviteHtml } from "@/services/resource/program/createProgramInviteHtml";
import { describe, expect, test } from "vitest";

describe(createProgramInviteHtml, () => {
  const surveyPath = "/view/Survey/surveyId";
  const token = crypto.randomUUID();

  test("tokens every link to the survey and fills the merge fields from the row", () => {
    expect.hasAssertions();

    const emailHtml = `<a href="https://esposter.com${surveyPath}">Take it</a> {{email}}`;

    expect(createProgramInviteHtml(emailHtml, surveyPath, { keyValue: "a", row: { email: "a" }, token })).toBe(
      `<a href="https://esposter.com${surveyPath}?t=${token}">Take it</a> a`,
    );
  });

  test("leaves a survey path inside longer text alone", () => {
    expect.hasAssertions();

    const emailHtml = `<a href="https://esposter.com${surveyPath}/extra">Other</a>`;

    expect(createProgramInviteHtml(emailHtml, surveyPath, { keyValue: "a", row: {}, token })).toBe(emailHtml);
  });
});
