export const PathFollowerComponentSetter = { Path: "path" } as const;
export type PathFollowerComponentSetter =
  (typeof PathFollowerComponentSetter)[keyof typeof PathFollowerComponentSetter];
