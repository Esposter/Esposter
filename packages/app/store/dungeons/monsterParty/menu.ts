import { Grid } from "@/models/dungeons/Grid";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { MenuOption } from "@/models/dungeons/scene/monsterParty/MenuOption";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { useMonsterDetailsSceneStore } from "@/store/dungeons/monsterDetails/scene";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { exhaustiveGuard } from "@esposter/shared";

export const useMenuStore = defineStore("dungeons/monsterParty/menu", () => {
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref() as Ref<Grid<MenuOption, MenuOption[][]>>;
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monsterPartyOptionGrid } = storeToRefs(monsterPartySceneStore);
  const { previousSceneKey } = usePreviousScene(SceneKey.MonsterParty);

  watch(
    previousSceneKey,
    (newPreviousSceneKey) => {
      menuOptionGrid.value =
        newPreviousSceneKey === SceneKey.Battle
          ? new Grid([[MenuOption.Summary], [MenuOption.Cancel]], true)
          : newPreviousSceneKey === SceneKey.Inventory
            ? new Grid([[MenuOption.Move], [MenuOption.Summary], [MenuOption.Release], [MenuOption.Cancel]], true)
            : new Grid([[MenuOption.Move], [MenuOption.Release], [MenuOption.Cancel]], true);
    },
    { immediate: true },
  );

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (!isMenuVisible.value)
      if (
        justDownInput === PlayerSpecialInput.Enter &&
        // @TODO: We should be able to use instanceof Monster
        // if some day in the future we can fully deserialize json data from local storage
        // to proper classes even for nested objects
        monsterPartyOptionGrid.value.value !== PlayerSpecialInput.Cancel
      ) {
        isMenuVisible.value = true;
        return true;
      } else return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (menuOptionGrid.value.value) {
        case MenuOption.Move:
          break;
        case MenuOption.Summary: {
          const monsterDetailsSceneStore = useMonsterDetailsSceneStore();
          const { selectedMonster } = storeToRefs(monsterDetailsSceneStore);
          const { launchScene } = usePreviousScene(scene.scene.key);
          selectedMonster.value = monsterPartyOptionGrid.value.value as Monster;
          launchScene(scene, SceneKey.MonsterDetails);
          break;
        }
        case MenuOption.Release:
          break;
        case MenuOption.Cancel:
          isMenuVisible.value = false;
          break;
        default:
          exhaustiveGuard(menuOptionGrid.value.value);
      }
    else if (justDownInput === PlayerSpecialInput.Enter || justDownInput === PlayerSpecialInput.Cancel)
      isMenuVisible.value = false;
    else if (isMovingDirection(justDownInput)) menuOptionGrid.value.move(justDownInput);

    return true;
  };

  return { isMenuVisible, menuOptionGrid, onPlayerInput };
});
