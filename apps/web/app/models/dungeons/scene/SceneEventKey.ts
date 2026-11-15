export const SceneEventKey = { ShowMessage: "ShowMessage" } as const;
export type SceneEventKey = (typeof SceneEventKey)[keyof typeof SceneEventKey];
