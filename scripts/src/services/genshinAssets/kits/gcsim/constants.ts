// oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this regex would otherwise infer
export const FLOW_START_REGEX: RegExp = /^[[{]/u;

// The constructor of a hit gcsim gives its target alone, `combat.NewSingleTargetHit(e.Key())`, with no reach beyond it
export const SINGLE_TARGET_HIT_CONSTRUCTOR = "NewSingleTargetHit";
// A bare name or a field of one, `stelePos` or `c.qPos`, which a constructor may name a place by
// oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this regex would otherwise infer
export const PLACE_REGEX: RegExp = /^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/u;
