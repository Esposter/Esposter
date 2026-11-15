export const LayerType = { Group: "group", Layer: "layer", ObjectGroup: "objectgroup" } as const;
export type LayerType = (typeof LayerType)[keyof typeof LayerType];
