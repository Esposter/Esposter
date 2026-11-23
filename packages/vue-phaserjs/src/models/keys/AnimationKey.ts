export type AnimationKey = AnimationKeyMap[keyof AnimationKeyMap];

// A consumer names its animations
// oxlint-disable-next-line typescript/no-empty-object-type -- by augmenting the map, and the key type follows
export interface AnimationKeyMap {}
