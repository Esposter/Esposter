import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";
import { describe, expect, test } from "vitest";

describe(resolveDomainChallenge, () => {
  const TIME_LIMIT_MILLISECONDS = 360_000;
  const progress = {
    defeatTarget: 10,
    defeats: 4,
    elapsedMilliseconds: 100_000,
    timeLimitMilliseconds: TIME_LIMIT_MILLISECONDS,
  };

  test("clearing a domain raises its petrified tree", () => {
    expect.hasAssertions();

    expect(resolveDomainChallenge({ ...progress, defeats: 10 }, { partyDown: false })).toStrictEqual(
      DomainChallengeOutcome.Cleared,
    );
  });

  test("running out of time returns the player to the entrance", () => {
    expect.hasAssertions();

    expect(
      resolveDomainChallenge({ ...progress, elapsedMilliseconds: TIME_LIMIT_MILLISECONDS }, { partyDown: false }),
    ).toStrictEqual(DomainChallengeOutcome.TimedOut);
  });

  test("every member down returns the player to the entrance", () => {
    expect.hasAssertions();

    expect(resolveDomainChallenge(progress, { partyDown: true })).toStrictEqual(DomainChallengeOutcome.Wiped);
  });

  test("a challenge with time and members left keeps running", () => {
    expect.hasAssertions();

    expect(resolveDomainChallenge(progress, { partyDown: false })).toStrictEqual(DomainChallengeOutcome.Running);
  });
});
