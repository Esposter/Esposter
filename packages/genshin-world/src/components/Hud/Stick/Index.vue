<script setup lang="ts">
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { Input } from "genshin-engine";
import type { CanvasRect } from "genshin-interface";

import { HudInterfaceRectName } from "#src/models/hud/HudInterfaceRectName";
import { TOUCH_STICK_POSITION } from "#src/services/hud/constants";
import { useEventListener } from "@vueuse/core";
import { WALK_MOVE_MAGNITUDE } from "genshin-engine";
import { GameRect } from "genshin-interface";

interface Props {
  input: Input;
  // The HUD's fitted rects, the stick's area, its group and its head among them
  interfaceRects: HudInterfaceRects;
  // The resolved rect of `InputController`, the stick's area's parent
  parent: CanvasRect;
}

const { input, interfaceRects, parent } = defineProps<Props>();
const area = useTemplateRef("area");
const group = useTemplateRef("group");
// The group where the game places it as it runs rather than where its rect in the tree stands
const groupRect = computed(() => ({
  ...interfaceRects[HudInterfaceRectName.MoveJoystickGroup],
  position: TOUCH_STICK_POSITION,
}));
// The thumb holding the stick, and how far it pushes, each axis from -1 to 1 of its reach
const stick = reactive({ isHeld: false, pointerId: 0, x: 0, y: 0 });
let originX = 0;
let originY = 0;
let reach = 0;
const push = computed(() => Math.hypot(stick.x, stick.y));
// Past the push the engine walks below, the character runs, and the stick shows which
const isRunning = computed(() => push.value >= WALK_MOVE_MAGNITUDE);
// The push's direction in degrees clockwise from up, which turns the mark on the stick's rim
const markAngle = computed(() => (Math.atan2(stick.x, -stick.y) * 180) / Math.PI);
// A quarter turn of a circle about the stick's centre, centred on up
const toArcPath = (radius: number) => {
  const end = radius * Math.SQRT1_2;
  return `M${-end} ${-end}A${radius} ${radius} 0 0 1 ${end} ${-end}`;
};
// A thumb landing in the stick's area holds it, and its push is how far it moves from where it landed over the reach
// The head would have inside the back, the tree's two sizes apart. The area keeps the thumb's moves wherever it goes
// Until it lifts
useEventListener(area, "pointerdown", (event) => {
  if (stick.isHeld || !area.value || !group.value) return;
  const [backSize = 0] = interfaceRects[HudInterfaceRectName.MoveJoystickGroup].size;
  const [headSize = 0] = interfaceRects[HudInterfaceRectName.MoveJoystickHead].size;
  originX = event.clientX;
  originY = event.clientY;
  reach = (group.value.getBoundingClientRect().width * (backSize - headSize)) / (2 * backSize);
  Object.assign(stick, { isHeld: true, pointerId: event.pointerId, x: 0, y: 0 });
  area.value.setPointerCapture(event.pointerId);
});
useEventListener(area, "pointermove", (event) => {
  if (!stick.isHeld || event.pointerId !== stick.pointerId) return;
  const offsetX = event.clientX - originX;
  const offsetY = event.clientY - originY;
  // Pushed past its reach, the push is a full one in the thumb's direction
  const distance = Math.max(Math.hypot(offsetX, offsetY), reach);
  stick.x = offsetX / distance;
  stick.y = offsetY / distance;
  input.setTouchStick(stick.x, stick.y);
});
useEventListener(area, ["pointerup", "pointercancel"], (event) => {
  if (!stick.isHeld || event.pointerId !== stick.pointerId) return;
  Object.assign(stick, { isHeld: false, x: 0, y: 0 });
  input.setTouchStick(0, 0);
});
// Hidden with the HUD, the stick lets go of its push
onUnmounted(() => {
  input.setTouchStick(0, 0);
});
</script>

<template>
  <!-- The touch layout's stick, in the game's tree under `MoveJoystick_H4`: the area a thumb lands in to move, the
       Bottom left of the screen and the strip over it, and the group that stands still, held or not, as the mobile
       Client's does on three recordings (16:9, 19.5:9 and 20:9), measured in canvas units on the 16:9 one. Its head is
       A faint ring with four chevrons that never travels; a push shows as a mark on a quarter of the rim turned to its
       Direction, a thin teal arc nearer the head while the character walks, and while it runs a cyan arc with an arrow
       At the rim, inside the back's faint dark ring. Provisional: the chevrons' shape, the back's stroke and the
       Arrow's size, which the recordings show too small to measure -->
  <GameRect #default="{ rect: areaRect }" :parent :rect="interfaceRects[HudInterfaceRectName.MoveJoystick]">
    <div ref="area" class="area">
      <GameRect
        class="extend"
        :parent="areaRect"
        :rect="interfaceRects[HudInterfaceRectName.MoveJoystickExtendTouch]"
      />
      <GameRect :parent="areaRect" :rect="groupRect">
        <svg ref="group" class="group" aria-hidden="true" viewBox="-102 -102 204 204">
          <circle v-if="stick.isHeld && isRunning" class="back" r="107" />
          <g v-if="stick.isHeld && push > 0" :transform="`rotate(${markAngle})`">
            <path v-if="isRunning" class="run" :d="toArcPath(104)" />
            <path v-if="isRunning" class="arrow" d="M 0 -113 L 5 -107 L -5 -107 Z" />
            <path v-else class="walk" :d="toArcPath(59)" />
          </g>
          <circle class="head" r="22.5" />
          <path
            class="chevrons"
            d="M -3 -12 L 0 -15 L 3 -12 M 12 -3 L 15 0 L 12 3 M 3 12 L 0 15 L -3 12 M -12 3 L -15 0 L -12 -3"
          />
        </svg>
      </GameRect>
    </div>
  </GameRect>
</template>

<style scoped>
.area,
.group {
  position: absolute;
  inset: 0;
}

.area,
.extend {
  pointer-events: auto;
  touch-action: none;
}

.group {
  overflow: visible;
  fill: none;
}

.back {
  stroke: rgb(0 0 0 / 0.07);
  stroke-width: 3;
}

.run {
  stroke: rgb(66 232 246);
  stroke-width: 5;
}

.arrow {
  fill: rgb(255 255 255 / 0.9);
}

.walk {
  stroke: rgb(40 222 199);
  stroke-width: 3.7;
}

.head {
  stroke: rgb(255 255 255 / 0.12);
  stroke-width: 5;
}

.chevrons {
  stroke: rgb(255 255 255 / 0.12);
  stroke-width: 1.5;
}
</style>
