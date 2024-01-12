import { PlayerBattleMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleMenuOption";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { type Position } from "grid-engine";

export const PlayerBattleMenuOptionCursorPositionMap: Record<PlayerBattleMenuOption, Position> = {
  [PlayerBattleMenuOption.Fight]: { x: INITIAL_CURSOR_POSITION.x, y: INITIAL_CURSOR_POSITION.y },
  [PlayerBattleMenuOption.Switch]: { x: 228, y: INITIAL_CURSOR_POSITION.y },
  [PlayerBattleMenuOption.Item]: { x: INITIAL_CURSOR_POSITION.x, y: 86 },
  [PlayerBattleMenuOption.Flee]: { x: 228, y: 86 },
};
