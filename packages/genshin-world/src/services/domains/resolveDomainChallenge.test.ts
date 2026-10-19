import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";
import { describe, expect, test } from "vitest";

describe(resolveDomainChallenge, () => {
  const TIME_LIMIT_MILLISECONDS = 360_000;
  const progress = {
    defeats: 4,
    defeatTarget: 10,
    elapsedMilliseconds: 100_000,
    timeLimitMilliseconds: TIME_LIMIT_MILLISECONDS,
  };

  test("clearing a domain raises its petrified tree", () => {
    expect.hasAssertions();

    expect(resolveDomainChallenge({ ...progress, defeats: 10 }, { isPartyDown: false })).toStrictEqual(
      DomainChallengeOutcome.Cleared,
    );
  });

  test("running out of time returns the player to the entrance", () => {
    expect.hasAssertions();

    expect(
      resolveDomainChallenge({ ...progress, elapsedMilliseconds: TIME_LIMIT_MILLISECONDS }, { isPartyDown: false }),
    ).toStrictEqual(DomainChallengeOutcome.TimedOut);
  });

  test("every member down returns the player to the entrance", () => {
    expect.hasAssertions();

    expect(resolveDomainChallenge(progress, { isPartyDown: true })).toStrictEqual(DomainChallengeOutcome.Wiped);
  });

  test("a challenge with time and members left keeps running", () => {
    expect.hasAssertions();

    expect(resolveDomainChallenge(progress, { isPartyDown: false })).toStrictEqual(DomainChallengeOutcome.Running);
  });
});
