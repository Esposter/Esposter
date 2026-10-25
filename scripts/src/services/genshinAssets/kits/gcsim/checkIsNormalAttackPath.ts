// The path segments that name the normal attack's group: its normal attacks, its charged attacks, its plunges and
// Their collisions, the actions a strike's reach is measured from as the mechanical reader measures each
export const checkIsNormalAttackPath = (path: string): boolean =>
  path
    .split(".")
    .some(
      (segment) =>
        segment === "normalAttacks" ||
        segment.startsWith("chargedAttack") ||
        segment === "plungeCollision" ||
        segment === "plunges",
    );
