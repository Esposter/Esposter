// How a PMX vertex is bound to the bones that move it, by the byte the file stores it as: to one bone, blended between
// Two or four, two blended spherically, or four by dual quaternions
export const PmxWeightDeform = { OneBone: 0, TwoBones: 1, FourBones: 2, Spherical: 3, DualQuaternion: 4 } as const;
export type PmxWeightDeform = (typeof PmxWeightDeform)[keyof typeof PmxWeightDeform];
