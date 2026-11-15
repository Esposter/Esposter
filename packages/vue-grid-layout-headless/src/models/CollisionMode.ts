// What a dropped item does to the items it lands on: push moves them down, swap trades places with the one it lands
// On, and prevent refuses the drop
export const CollisionMode = { Prevent: "Prevent", Push: "Push", Swap: "Swap" } as const;
export type CollisionMode = (typeof CollisionMode)[keyof typeof CollisionMode];
