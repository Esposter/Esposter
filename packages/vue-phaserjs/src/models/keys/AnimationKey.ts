// Empty by design — a consumer names its animations by augmenting the map, and the key type follows
export type AnimationKey = AnimationKeyMap[keyof AnimationKeyMap];

export interface AnimationKeyMap {}
