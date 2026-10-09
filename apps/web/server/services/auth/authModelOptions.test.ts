import { authModelOptions } from "#server/services/auth/authModelOptions";
import { parseAdditionalUserInputFromProviderProfile } from "better-auth/db";
import { describe, expect, test } from "vitest";

describe("authModelOptions", () => {
  // A first sign-in through a provider reads the user's added fields from the provider's profile, which carries no
  // Biography, before the user is created, so a required field there with no default refuses the sign-up
  test("gives a provider's new user an empty biography", () => {
    expect.hasAssertions();

    expect(parseAdditionalUserInputFromProviderProfile(authModelOptions, {}, "create").biography).toBe("");
  });
});
