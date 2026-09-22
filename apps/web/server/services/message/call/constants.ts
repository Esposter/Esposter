// A generated call session id can only collide with one already taken, so the insert is retried rather than
// Failed — bounded, because a run of collisions that long is a broken generator, not bad luck
export const MAX_CALL_SESSION_ID_ATTEMPTS = 3;
