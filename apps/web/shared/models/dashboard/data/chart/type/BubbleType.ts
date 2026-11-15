export const BubbleType = { "3D": "3D" } as const;
export type BubbleType = (typeof BubbleType)[keyof typeof BubbleType];
