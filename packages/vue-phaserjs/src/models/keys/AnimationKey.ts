export type AnimationKey = AnimationKeyMap[keyof AnimationKeyMap];

// oxlint-disable-next-line typescript/no-empty-object-type -- A consumer names its animations by augmenting the map, and the key type follows
export interface AnimationKeyMap {}
