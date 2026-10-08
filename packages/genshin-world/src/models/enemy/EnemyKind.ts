import { Element } from "#src/models/Element";
import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyType } from "#src/models/enemy/EnemyType";
import { z } from "zod";

// A kind's row of the game's monster table: its family and type, its base stats and the level curve that scales each,
// By the curve's own name in the game's curve table, and the share of each element's and physical damage it resists
export interface EnemyKind {
  attackCurve: string;
  baseAttack: number;
  baseDefense: number;
  baseHealth: number;
  defenseCurve: string;
  elementResistances: Record<Element, number>;
  enemyFamily: EnemyFamily;
  enemyType: EnemyType;
  healthCurve: string;
  id: EnemyKindId;
  // The text id of the kind's name in the game's text, which the names of the world's language are read by
  nameTextId: string;
  physicalResistance: number;
}

export const enemyKindSchema = z.object({
  attackCurve: z.string().min(1),
  baseAttack: z.number().nonnegative(),
  baseDefense: z.number().nonnegative(),
  baseHealth: z.number().positive(),
  defenseCurve: z.string().min(1),
  elementResistances: z.record(z.enum(Element), z.number()),
  enemyFamily: z.enum(EnemyFamily) satisfies z.ZodType<EnemyFamily>,
  enemyType: z.enum(EnemyType) satisfies z.ZodType<EnemyType>,
  healthCurve: z.string().min(1),
  id: z.enum(EnemyKindId) satisfies z.ZodType<EnemyKindId>,
  nameTextId: z.string().min(1),
  physicalResistance: z.number(),
}) satisfies z.ZodType<EnemyKind>;
