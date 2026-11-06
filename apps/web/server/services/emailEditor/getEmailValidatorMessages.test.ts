import { getEmailValidatorMessages } from "#server/services/emailEditor/getEmailValidatorMessages";
import { EmailValidationLevel } from "#shared/models/pageBuilder/EmailValidationLevel";
import { describe, expect, test } from "vitest";

describe(getEmailValidatorMessages, () => {
  const firstMessage = "a";
  const secondMessage = "b";

  test("a refused compile lists each validator message at the strict level", () => {
    expect.hasAssertions();

    // MJML's ValidationError carries each message it found beside its own text
    const refusal = Object.assign(new Error(" "), { errors: [{ message: firstMessage }, { message: secondMessage }] });
    const messages = getEmailValidatorMessages(refusal);

    expect(messages).toStrictEqual([
      { level: EmailValidationLevel.Strict, message: firstMessage },
      { level: EmailValidationLevel.Strict, message: secondMessage },
    ]);
  });

  test("an error that is not a validator refusal lists no message", () => {
    expect.hasAssertions();

    const messages = getEmailValidatorMessages(new Error(" "));

    expect(messages).toStrictEqual([]);
  });
});
