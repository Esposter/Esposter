<script setup lang="ts">
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { Input } from "genshin-engine";
import type { CanvasRect } from "genshin-interface";

import { HudInterfaceRectName } from "#src/models/hud/HudInterfaceRectName";
import { TOUCH_STICK_REST_HEAD_SHARE, TOUCH_STICK_REST_POSITION } from "#src/services/hud/constants";
import { useEventListener } from "@vueuse/core";
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
const back = useTemplateRef("back");
const head = useTemplateRef("head");
// The group at rest, where the game places it as it runs rather than where its rect in the tree stands
const restGroupRect = computed(() => ({
  ...interfaceRects[HudInterfaceRectName.MoveJoystickGroup],
  position: TOUCH_STICK_REST_POSITION,
}));
// The thumb holding the stick: how far the group stands from its rest, round where the thumb landed, and how far the
// Head is pushed, each axis from -1 to 1 of its reach
const stick = reactive({ isHeld: false, offsetX: 0, offsetY: 0, pointerId: 0, x: 0, y: 0 });
let centreX = 0;
let centreY = 0;
let reach = 0;
const groupStyle = computed(() => ({ translate: `${stick.offsetX}px ${stick.offsetY}px` }));
const headStyle = computed(() => ({ translate: `${stick.x * reach}px ${stick.y * reach}px` }));
// A thumb landing in the stick's area holds the stick round where it landed, and its push reaches as far as the head
// Stays inside the back. The area keeps the thumb's moves wherever it goes until it lifts
useEventListener(area, "pointerdown", (event) => {
  if (stick.isHeld || !area.value || !group.value || !back.value || !head.value) return;
  const { height, left, top, width } = group.value.getBoundingClientRect();
  centreX = event.clientX;
  centreY = event.clientY;
  reach = (back.value.offsetWidth - head.value.offsetWidth) / 2;
  Object.assign(stick, {
    isHeld: true,
    offsetX: centreX - (left + width / 2),
    offsetY: centreY - (top + height / 2),
    pointerId: event.pointerId,
    x: 0,
    y: 0,
  });
  area.value.setPointerCapture(event.pointerId);
});
useEventListener(area, "pointermove", (event) => {
  if (!stick.isHeld || event.pointerId !== stick.pointerId) return;
  const offsetX = event.clientX - centreX;
  const offsetY = event.clientY - centreY;
  // Pushed past its reach, the head stays at its rim in the thumb's direction
  const distance = Math.max(Math.hypot(offsetX, offsetY), reach);
  stick.x = offsetX / distance;
  stick.y = offsetY / distance;
  input.setTouchStick(stick.x, stick.y);
});
useEventListener(area, ["pointerup", "pointercancel"], (event) => {
  if (!stick.isHeld || event.pointerId !== stick.pointerId) return;
  Object.assign(stick, { isHeld: false, offsetX: 0, offsetY: 0, x: 0, y: 0 });
  input.setTouchStick(0, 0);
});
// Hidden with the HUD, the stick lets go of its push
onUnmounted(() => {
  input.setTouchStick(0, 0);
});
</script>

<template>
  <!-- The touch layout's stick, in the game's tree under `MoveJoystick_H4`: the area a thumb lands in to move, the
       Bottom left of the screen and the strip over it, and the group of back and head that rests as a faint ring and
       Stands round the thumb while it is held. Provisional: the back's and the held head's looks -->
  <GameRect #default="{ rect: areaRect }" :parent :rect="interfaceRects[HudInterfaceRectName.MoveJoystick]">
    <div ref="area" class="area" :class="{ held: stick.isHeld }">
      <GameRect
        class="extend"
        :parent="areaRect"
        :rect="interfaceRects[HudInterfaceRectName.MoveJoystickExtendTouch]"
      />
      <GameRect #default="{ rect: groupRect }" :parent="areaRect" :rect="restGroupRect" :style="groupStyle">
        <div ref="group" class="group">
          <div ref="back" class="back" />
          <GameRect :parent="groupRect" :rect="interfaceRects[HudInterfaceRectName.MoveJoystickHead]">
            <div ref="head" class="head" :style="headStyle" />
          </GameRect>
        </div>
      </GameRect>
    </div>
  </GameRect>
</template>

<style scoped>
.area,
.group,
.back,
.head {
  position: absolute;
  inset: 0;
}

.area,
.extend {
  pointer-events: auto;
  touch-action: none;
}

.back {
  border: calc(var(--canvas-unit) * 2) solid rgb(255 255 255 / 0.5);
  border-radius: 50%;
  opacity: 0;
}

.head {
  border: calc(var(--canvas-unit) * 2) solid rgb(255 255 255 / 0.35);
  border-radius: 50%;
  scale: v-bind(TOUCH_STICK_REST_HEAD_SHARE);
}

.held .back {
  opacity: 1;
}

.held .head {
  border-color: transparent;
  background: rgb(255 255 255 / 0.7);
  scale: 1;
}
</style>
