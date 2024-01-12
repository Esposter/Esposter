import { PlayerBattleSubMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleSubMenuOption";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { type Position } from "grid-engine";

export const PlayerBattleSubMenuOptionCursorPositionMap: Record<PlayerBattleSubMenuOption, Position> = {
  [PlayerBattleSubMenuOption.Move1]: { x: INITIAL_CURSOR_POSITION.x, y: INITIAL_CURSOR_POSITION.y },
  [PlayerBattleSubMenuOption.Move2]: { x: 228, y: INITIAL_CURSOR_POSITION.y },
  [PlayerBattleSubMenuOption.Move3]: { x: INITIAL_CURSOR_POSITION.x, y: 86 },
  [PlayerBattleSubMenuOption.Move4]: { x: 228, y: 86 },
};
