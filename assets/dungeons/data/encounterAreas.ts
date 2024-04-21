import { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import { MonsterName } from "@/models/dungeons/monster/MonsterName";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseEncounterAreas: Except<EncounterArea, "name">[] = [
  {
    id: Area.Grass,
    monsterNames: [MonsterName.Aquavalor, MonsterName.Carnodusk, MonsterName.Frostsaber, MonsterName.Ignivolt],
  },
];

export const encounterAreas: EncounterArea[] = baseEncounterAreas.map((bea) => ({
  ...bea,
  name: prettifyName(bea.id),
}));
