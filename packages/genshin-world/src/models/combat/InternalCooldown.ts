// One internal cooldown's timer and hit counter, kept per attacker, target and tag: when its timer last started, in
// Seconds, and which hit since then the last one was
export interface InternalCooldown {
  hitIndex: number;
  startSeconds: number;
}
