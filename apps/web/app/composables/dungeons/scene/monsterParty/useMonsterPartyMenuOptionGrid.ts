import { Grid } from "#src/models/dungeons/Grid";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { MenuOption } from "#src/models/dungeons/scene/monsterParty/MenuOption";
import { usePlayerStore } from "#src/store/dungeons/player";

const MonsterPartyMenuOptionGrid = new Grid<MenuOption[][]>({ grid: [], isWrapping: true });

export const useMonsterPartyMenuOptionGrid = createUseGrid(MonsterPartyMenuOptionGrid, (grid) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const { previousSceneKey } = usePreviousScene(SceneKey.MonsterParty);
  grid.grid = computed(() => {
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
});
