import { createProgramInviteFiles } from "@/services/resource/program/createProgramInviteFiles";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createProgramInviteFiles, () => {
  const surveyPath = "/view/Survey/surveyId";
  const token = v7();

  test("keeps every participant when two key values sanitize to one file name", () => {
    expect.hasAssertions();

    const invites = [
      { keyValue: "12/3", row: {}, token },
      { keyValue: "12-3", row: {}, token },
    ];

    expect(Object.keys(createProgramInviteFiles("", surveyPath, invites))).toStrictEqual(["12-3", "12-3-2"]);
  });
});
