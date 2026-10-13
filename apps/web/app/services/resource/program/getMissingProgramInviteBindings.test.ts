import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getMissingProgramInviteBindings } from "@/services/resource/program/getMissingProgramInviteBindings";
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
        audience: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
        emailId: crypto.randomUUID(),
        keyColumn: "email",
        surveyId: crypto.randomUUID(),
      }),
    ).toStrictEqual([]);
  });
});
