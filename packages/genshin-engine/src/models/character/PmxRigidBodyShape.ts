// A PMX rigid body's collision shape, by the byte the file stores it as
export const PmxRigidBodyShape = { Sphere: 0, Box: 1, Capsule: 2 } as const;
export type PmxRigidBodyShape = (typeof PmxRigidBodyShape)[keyof typeof PmxRigidBodyShape];
