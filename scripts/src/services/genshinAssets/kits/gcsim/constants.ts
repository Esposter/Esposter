export const FLOW_START_REGEX = /^[[{]/u;

// The constructor of a hit gcsim gives its target alone, `combat.NewSingleTargetHit(e.Key())`, with no reach beyond it
export const SINGLE_TARGET_HIT_CONSTRUCTOR = "NewSingleTargetHit";
// A bare name or a field of one, `stelePos` or `c.qPos`, which a constructor may name a place by
export const PLACE_REGEX = /^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/u;
