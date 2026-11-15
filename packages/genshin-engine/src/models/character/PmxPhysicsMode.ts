// What moves a PMX rigid body, by the byte the file stores it as: its bone, the physics, or the physics with its bone's
// Place kept
export const PmxPhysicsMode = { FollowBone: 0, Physics: 1, PhysicsWithBone: 2 } as const;
export type PmxPhysicsMode = (typeof PmxPhysicsMode)[keyof typeof PmxPhysicsMode];
