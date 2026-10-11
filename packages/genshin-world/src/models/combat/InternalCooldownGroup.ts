// How an internal cooldown counts, as the game's attenuation group sets it: the seconds after which a hit restarts it,
// And the share each hit since the restart takes, the last share holding for every hit past the end. The share is of
// The hit's gauge where the group counts an element's application, and of its damage where it counts a reaction's
export interface InternalCooldownGroup {
  resetIntervalSeconds: number;
  sequence: readonly number[];
}
