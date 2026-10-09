import type { Seelie } from "#src/models/puzzle/Seelie";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { SEELIE_RETURN_SECONDS, SEELIE_ROUTE_SECONDS } from "#src/services/puzzle/constants";

// A Seelie moved on the fixed step. A resting one is led once the player follows it, and a led one walks its route while
// Followed and goes back to where it rests once it has been left unfollowed for its time. Settled in its court it stays
export const stepSeelie = (seelie: Seelie, deltaSeconds: number, isFollowed: boolean): void => {
  if (seelie.state === SeelieState.Settled) return;
  if (seelie.state === SeelieState.Resting) {
    if (isFollowed) seelie.state = SeelieState.Led;
  } else if (isFollowed) {
    seelie.unfollowedSeconds = 0;
    seelie.progress = Math.min(1, seelie.progress + deltaSeconds / SEELIE_ROUTE_SECONDS);
    if (seelie.progress === 1) seelie.state = SeelieState.Settled;
  } else {
    seelie.unfollowedSeconds += deltaSeconds;
    if (seelie.unfollowedSeconds >= SEELIE_RETURN_SECONDS) {
      seelie.progress = 0;
      seelie.unfollowedSeconds = 0;
      seelie.state = SeelieState.Resting;
    }
  }
};
