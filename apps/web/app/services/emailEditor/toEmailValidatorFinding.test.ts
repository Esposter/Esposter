import type { EmailValidatorMessage } from "#shared/models/pageBuilder/EmailValidatorMessage";

import { EmailValidationLevel } from "#shared/models/pageBuilder/EmailValidationLevel";
import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { toEmailValidatorFinding } from "@/services/emailEditor/toEmailValidatorFinding";
import { describe, expect, test } from "vitest";

describe(toEmailValidatorFinding, () => {
  test("a validator message becomes a finding", () => {
    expect.hasAssertions();

    const validatorMessages: EmailValidatorMessage[] = [
      { level: EmailValidationLevel.Strict, message: "a" },
      { level: EmailValidationLevel.Soft, message: "b" },
    ];
    const findings = validatorMessages.map((validatorMessage) => toEmailValidatorFinding(validatorMessage));

    expect(findings).toStrictEqual([
      { message: "a", nodeId: "", severity: EditorFindingSeverity.Error },
      { message: "b", nodeId: "", severity: EditorFindingSeverity.Warning },
    ]);
  });
});
