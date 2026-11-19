// The shape an animal is drawn as: its kind's silhouette once one is fitted, else the capsule every animal is drawn as
export const WildlifeShape = { Capsule: "Capsule", Silhouette: "Silhouette" } as const;
export type WildlifeShape = (typeof WildlifeShape)[keyof typeof WildlifeShape];
