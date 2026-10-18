import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";
import type { GroundPoint } from "genshin-engine";

// The members of a camp standing evenly round its centre at a radius, in the order given, each of the kind and level its
// Spawn names and standing at that spawn, with no patrol
export const placeCampRing = (
  center: GroundPoint,
  radius: number,
  spawns: readonly Pick<EnemyCampMember, "enemyKindId" | "level">[],
): EnemyCampMember[] =>
  spawns.map(({ enemyKindId, level }, index) => {
    const angle = (index / spawns.length) * 2 * Math.PI;
    return {
      enemyKindId,
      id: String(index),
      level,
      patrol: [],
      position: { x: center.x + Math.cos(angle) * radius, z: center.z + Math.sin(angle) * radius },
    };
  });
