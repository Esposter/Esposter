<script setup lang="ts">
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { Input } from "genshin-engine";

import { HudInterfaceRectName } from "#src/models/hud/HudInterfaceRectName";
import {
  STICK_VIEW_BOX_SIZE,
  TOUCH_STICK_CLEARANCE_X,
  TOUCH_STICK_CLEARANCE_Y,
  TOUCH_STICK_FADE_MS,
} from "#src/services/hud/constants";
import { useEventListener, useWindowSize } from "@vueuse/core";
import { WALK_MOVE_MAGNITUDE } from "genshin-engine";

interface Props {
  input: Input;
  // The HUD's fitted rects, the stick's group and its head among them
  interfaceRects: HudInterfaceRects;
}

const { input, interfaceRects } = defineProps<Props>();
// The drawing is centred on its group, so its view box runs the same distance either side of the origin
const viewBox = `${-STICK_VIEW_BOX_SIZE / 2} ${-STICK_VIEW_BOX_SIZE / 2} ${STICK_VIEW_BOX_SIZE} ${STICK_VIEW_BOX_SIZE}`;
const area = useTemplateRef("area");
const group = useTemplateRef("group");
const { height, width } = useWindowSize();
// The thumb holding the stick, and how far it pushes, each axis from -1 to 1 of its reach
const stick = reactive({ isHeld: false, pointerId: 0, x: 0, y: 0 });
// Where the group stands in the area, in pixels: the centre of a held stick, its landing pulled in from the screen's edges
const centre = reactive({ x: 0, y: 0 });
let originX = 0;
let originY = 0;
let reach = 0;
const push = computed(() => Math.hypot(stick.x, stick.y));
// Past the push the engine walks below, the character runs, and the stick shows which
const isRunning = computed(() => push.value >= WALK_MOVE_MAGNITUDE);
// The push's direction in degrees clockwise from up, which turns the mark on the stick's rim
const markAngle = computed(() => (Math.atan2(stick.x, -stick.y) * 180) / Math.PI);
// How far the head's centre travels from the group's, in canvas units: the back's radius less the head's
const headTravel = computed(() => {
  const [backSize = 0] = interfaceRects[HudInterfaceRectName.MoveJoystickGroup].size;
  const [headSize = 0] = interfaceRects[HudInterfaceRectName.MoveJoystickHead].size;
  return (backSize - headSize) / 2;
});
// The same travel in the drawing's own units, which the group's canvas width spans the view box of
const drawnHeadTravel = computed(() => {
  const [backSize = 0] = interfaceRects[HudInterfaceRectName.MoveJoystickGroup].size;
  return (headTravel.value * STICK_VIEW_BOX_SIZE) / backSize;
});
// The group is drawn at its rect's size in canvas units, centred on the point it stands on, and fades in and out
const groupStyle = computed(() => {
  const [groupWidth = 0, groupHeight = 0] = interfaceRects[HudInterfaceRectName.MoveJoystickGroup].size;
  return {
    height: `calc(var(--canvas-unit) * ${groupHeight})`,
    left: `${centre.x}px`,
    opacity: stick.isHeld ? 1 : 0,
    top: `${centre.y}px`,
    transition: `opacity ${TOUCH_STICK_FADE_MS}ms`,
    width: `calc(var(--canvas-unit) * ${groupWidth})`,
  };
});
// A quarter turn of a circle about the stick's centre, centred on up
const toArcPath = (radius: number) => {
  const end = radius * Math.SQRT1_2;
  return `M${-end} ${-end}A${radius} ${radius} 0 0 1 ${end} ${-end}`;
};
// A thumb landing on the screen's left half holds the stick. The group stands on the landing point, pulled in from each
// Edge of the screen until its ring keeps the clearance, and the thumb's push is how far it moves from where it landed,
// Over the reach: the head's travel in pixels, so a push past it is a full push in the thumb's direction
useEventListener(area, "pointerdown", (event) => {
  if (stick.isHeld || !area.value || !group.value) return;
  const [backSize = 0] = interfaceRects[HudInterfaceRectName.MoveJoystickGroup].size;
  const pixelsPerUnit = group.value.getBoundingClientRect().width / backSize;
  const areaRect = area.value.getBoundingClientRect();
  const clearanceX = TOUCH_STICK_CLEARANCE_X * pixelsPerUnit;
  const clearanceY = TOUCH_STICK_CLEARANCE_Y * pixelsPerUnit;
  originX = event.clientX;
  originY = event.clientY;
  reach = pixelsPerUnit * headTravel.value;
  Object.assign(centre, {
    x: Math.min(Math.max(event.clientX, clearanceX), width.value - clearanceX) - areaRect.left,
    y: Math.min(Math.max(event.clientY, clearanceY), height.value - clearanceY) - areaRect.top,
  });
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
// A lift, a cancel or a lost capture lets go of the stick, which then fades out with nothing held
useEventListener(area, ["pointerup", "pointercancel", "lostpointercapture"], (event) => {
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
  <!-- The touch layout's stick on the screen's left half, which draws nothing at rest. A thumb landing there holds it, the
       Group centred where the thumb landed and pulled in from the edges so the ring stays on the screen. Its back and head
       Are the game's `GrpJoyStick` and `ImgJoyStickHead`, the head moving within the ring as the thumb drags. A push shows as
       A mark on a quarter of the rim turned to its direction, a thin teal arc nearer the head while the character walks, and
       While it runs a cyan arc with an arrow at the rim, inside the back's faint dark ring. Provisional: the chevrons' shape,
       The back's stroke and the arrow's size, which the recordings show too small to measure -->
  <div ref="area" class="area">
    <svg ref="group" class="group" :style="groupStyle" aria-hidden="true" :viewBox>
      <circle v-if="stick.isHeld && isRunning" class="back" r="107" />
      <g v-if="stick.isHeld && push > 0" :transform="`rotate(${markAngle})`">
        <path v-if="isRunning" class="run" :d="toArcPath(104)" />
        <path v-if="isRunning" class="arrow" d="M 0 -113 L 5 -107 L -5 -107 Z" />
        <path v-else class="walk" :d="toArcPath(59)" />
      </g>
      <g :transform="`translate(${stick.x * drawnHeadTravel} ${stick.y * drawnHeadTravel})`">
        <circle class="head" r="22.5" />
        <path
          class="chevrons"
          d="M -3 -12 L 0 -15 L 3 -12 M 12 -3 L 15 0 L 12 3 M 3 12 L 0 15 L -3 12 M -12 3 L -15 0 L -12 -3"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.area {
  position: absolute;
  inset: 0 50% 0 0;
  pointer-events: auto;
  touch-action: none;
}

.group {
  position: absolute;
  overflow: visible;
  fill: none;
  pointer-events: none;
  transform: translate(-50%, -50%);
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
