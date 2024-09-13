import { Grid } from "@/models/dungeons/Grid";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { MenuOption } from "@/models/dungeons/scene/monsterParty/MenuOption";
import { usePlayerStore } from "@/store/dungeons/player";

const MonsterPartyMenuOptionGrid = new Grid<MenuOption, MenuOption[][]>({
  grid: [],
  wrap: true,
});

let isInitialized = false;

export const useMonsterPartyMenuOptionGrid = () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const { previousSceneKey } = usePreviousScene(SceneKey.MonsterParty);

  if (!isInitialized) {
    MonsterPartyMenuOptionGrid.grid = computed(() => {
      switch (previousSceneKey.value) {
        case SceneKey.Battle:
          return [[MenuOption.Summary], [MenuOption.Cancel]];
        case SceneKey.Inventory:
          return player.value.monsters.length > 1
            ? [[MenuOption.Move], [MenuOption.Summary], [MenuOption.Release], [MenuOption.Cancel]]
            : [[MenuOption.Summary], [MenuOption.Release], [MenuOption.Cancel]];
        default:
          return player.value.monsters.length > 1
            ? [[MenuOption.Move], [MenuOption.Release], [MenuOption.Cancel]]
            : [[MenuOption.Release], [MenuOption.Cancel]];
      }
    });
    isInitialized = true;
  }

  return MonsterPartyMenuOptionGrid;
};
