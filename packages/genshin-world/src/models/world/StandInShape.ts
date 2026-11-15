// The shape a world stand-in is drawn as: a sphere for an Oculus, a rock for a mining outcrop
export const StandInShape = { Rock: "rock", Sphere: "sphere" } as const;
export type StandInShape = (typeof StandInShape)[keyof typeof StandInShape];
