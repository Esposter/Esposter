// How an internal cooldown counts, as the game's attenuation group sets it: the seconds after which a hit restarts it,
// And the share of its gauge each hit since the restart applies, the last share holding for every hit past the end
export interface InternalCooldownGroup {
  gaugeSequence: readonly number[];
  resetIntervalSeconds: number;
}
