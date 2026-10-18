import type { FishingBite } from "#src/models/fishing/FishingBite";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { stepFishingBite } from "#src/services/fishing/stepFishingBite";
import { describe, expect, test } from "vitest";

describe(stepFishingBite, () => {
  const BITE_TIMEOUT = 5;
  const NIBBLE_SECONDS = 1;
  const SHORT_SECONDS = 0.5;
  const NIBBLING: FishingBite = { elapsedSeconds: 0, nibbleSeconds: NIBBLE_SECONDS };
  const BITING: FishingBite = { elapsedSeconds: NIBBLE_SECONDS, nibbleSeconds: NIBBLE_SECONDS };

  test("a fish nibbles for a drawn time and then bites", () => {
    expect.hasAssertions();

    expect(
      stepFishingBite(NIBBLING, { biteTimeout: BITE_TIMEOUT, isStruck: false, seconds: SHORT_SECONDS }),
    ).toStrictEqual({
      bite: { elapsedSeconds: SHORT_SECONDS, nibbleSeconds: NIBBLE_SECONDS },
      phase: FishingPhase.Waiting,
    });
    expect(
      stepFishingBite(NIBBLING, { biteTimeout: BITE_TIMEOUT, isStruck: false, seconds: NIBBLE_SECONDS }),
    ).toStrictEqual({
      bite: { elapsedSeconds: NIBBLE_SECONDS, nibbleSeconds: NIBBLE_SECONDS },
      phase: FishingPhase.Biting,
    });
  });

  test("a strike while nibbling scares the fish off", () => {
    expect.hasAssertions();

    expect(
      stepFishingBite(NIBBLING, { biteTimeout: BITE_TIMEOUT, isStruck: true, seconds: SHORT_SECONDS }),
    ).toStrictEqual({
      bite: { elapsedSeconds: SHORT_SECONDS, nibbleSeconds: NIBBLE_SECONDS },
      phase: FishingPhase.Aiming,
    });
  });

  test("a bite left unstruck lapses", () => {
    expect.hasAssertions();

    expect(
      stepFishingBite(BITING, { biteTimeout: BITE_TIMEOUT, isStruck: false, seconds: BITE_TIMEOUT - 1 }).phase,
    ).toBe(FishingPhase.Biting);
    expect(stepFishingBite(BITING, { biteTimeout: BITE_TIMEOUT, isStruck: false, seconds: BITE_TIMEOUT }).phase).toBe(
      FishingPhase.Aiming,
    );
  });

  test("a strike while biting starts the reel", () => {
    expect.hasAssertions();

    expect(
      stepFishingBite(BITING, { biteTimeout: BITE_TIMEOUT, isStruck: true, seconds: SHORT_SECONDS }),
    ).toStrictEqual({
      bite: { elapsedSeconds: NIBBLE_SECONDS + SHORT_SECONDS, nibbleSeconds: NIBBLE_SECONDS },
      phase: FishingPhase.Reeling,
    });
  });
});
