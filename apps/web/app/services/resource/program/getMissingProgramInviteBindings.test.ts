import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getMissingProgramInviteBindings } from "@/services/resource/program/getMissingProgramInviteBindings";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getMissingProgramInviteBindings, () => {
  test("names every binding an invite reads that is unset", () => {
    expect.hasAssertions();

    expect(getMissingProgramInviteBindings({ emailId: "", keyColumn: "", surveyId: "" })).toStrictEqual([
      "an email",
      "an audience",
      "a key column",
      "a survey",
    ]);
  });

  test("names nothing once every binding is set", () => {
    expect.hasAssertions();

    expect(
      getMissingProgramInviteBindings({
        audience: { id: v7(), type: DatasetProviderType.Sheet },
        emailId: v7(),
        keyColumn: "email",
        surveyId: v7(),
      }),
    ).toStrictEqual([]);
  });
});
