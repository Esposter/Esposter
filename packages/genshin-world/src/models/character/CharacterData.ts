import type { AscensionPhase } from "#src/models/character/AscensionPhase";
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { GrowAttribute } from "#src/models/character/GrowAttribute";

import { ascensionPhaseSchema } from "#src/models/character/AscensionPhase";
import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { BodyType } from "#src/models/character/BodyType";
import { growAttributeSchema } from "#src/models/character/GrowAttribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { z } from "zod";

// A character of the game's roster as its tables hold it, by the game's own id: its element, which the Traveler has none
// Of until they resonate with a statue; the kind of weapon it wields and the one it comes with; its rarity in stars;
// The catalogue region its association names, none for one that names no nation; its body; the attributes that grow
// With its level, its ascension phases, and the attributes every level of it starts with
export interface CharacterData {
  ascensionPhases: AscensionPhase[];
  attributeLines: AttributeLine[];
  bodyType: BodyType;
  element?: Element;
  growAttributes: GrowAttribute[];
  id: number;
  initialWeaponId: number;
  rarity: number;
  regionId?: string;
  weaponType: WeaponType;
}

export const characterDataSchema = z.object({
  ascensionPhases: z.array(ascensionPhaseSchema).min(1),
  attributeLines: z.array(attributeLineSchema),
  bodyType: z.enum(BodyType),
  element: z.enum(Element).optional(),
  growAttributes: z.array(growAttributeSchema),
  id: z.int().positive(),
  initialWeaponId: z.int().positive(),
  rarity: z.int().min(1).max(5),
  regionId: z.string().min(1).optional(),
  weaponType: z.enum(WeaponType),
}) satisfies z.ZodType<CharacterData>;
