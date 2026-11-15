// How a prop kind's outline is fitted: a solid kind as the visual hull of its mesh, a round one as the lathe of its silhouette
export const PropShape = { Hull: "hull", Lathe: "lathe" } as const;
export type PropShape = (typeof PropShape)[keyof typeof PropShape];
