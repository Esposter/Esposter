import { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "@/util/types/Except";

const baseEncounterAreas: Except<EncounterArea, "name">[] = [
  {
    id: Area.Grass,
    monsterKeys: [MonsterKey.Aquavalor, MonsterKey.Carnodusk, MonsterKey.Frostsaber, MonsterKey.Ignivolt],
  },
];

export const encounterAreas: EncounterArea[] = baseEncounterAreas.map((bea) => ({
  ...bea,
  name: prettifyName(bea.id),
}));
