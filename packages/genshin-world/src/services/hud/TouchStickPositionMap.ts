import { TouchStickShape } from "#src/models/hud/TouchStickShape";

// The stick's group centre in canvas units, by the screen's shape, from the mobile client's recordings. On the 16:9
// Recording (youtu.be/d9ZWM3cAlf0, 6.1, 33 held frames) the canvas has no inset: the group stands 199.5 units in and
// 172.5 up from its area's foot, where the tree's own rect puts it 102 in and up. A wider phone's canvas insets ours by
// 59 units at its sides, and the game's stick stands 87 units further in on 19.5:9 (the 20:9 recording, 95), so past the
// Inset the stick moves 28 units (36) further in than the 16:9 place
const STICK_IN_16X9 = 199.5;
const STICK_UP = 172.5;
const CANVAS_INSET_ON_WIDE_SCREEN = 59;

export const TouchStickPositionMap: Readonly<Record<TouchStickShape, [number, number]>> = {
  [TouchStickShape.Ratio16x9]: [STICK_IN_16X9, STICK_UP],
  [TouchStickShape.Ratio19Point5x9]: [STICK_IN_16X9 + 87 - CANVAS_INSET_ON_WIDE_SCREEN, STICK_UP],
  [TouchStickShape.Ratio20x9]: [STICK_IN_16X9 + 95 - CANVAS_INSET_ON_WIDE_SCREEN, STICK_UP],
};
