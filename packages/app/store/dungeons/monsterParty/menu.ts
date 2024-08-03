import { Grid } from "@/models/dungeons/Grid";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { MenuOption } from "@/models/dungeons/scene/monsterParty/MenuOption";
import { isMovingDirection } from "@/services/dungeons/UI/input/isMovingDirection";
import { exhaustiveGuard } from "@esposter/shared";

export const useMenuStore = defineStore("dungeons/monsterParty/menu", () => {
  const isMenuVisible = ref(false);
  const menuOptionGrid = ref() as Ref<Grid<MenuOption, MenuOption[][]>>;
  const { previousSceneKey } = usePreviousScene(SceneKey.MonsterParty);

  watch(
    previousSceneKey,
    (newPreviousSceneKey) => {
      menuOptionGrid.value =
        newPreviousSceneKey === SceneKey.Battle
          ? new Grid([[MenuOption.Select], [MenuOption.Summary], [MenuOption.Cancel]], true)
          : new Grid([[MenuOption.Move], [MenuOption.Summary], [MenuOption.Release], [MenuOption.Cancel]], true);
    },
    { immediate: true },
  );

  const onPlayerInput = (_scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (!isMenuVisible.value)
      if (justDownInput === PlayerSpecialInput.Enter) {
        isMenuVisible.value = true;
        return true;
      } else return false;

    if (justDownInput === PlayerSpecialInput.Confirm)
      switch (menuOptionGrid.value.value) {
        case MenuOption.Select:
        case MenuOption.Move:
        case MenuOption.Summary:
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
