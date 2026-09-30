<script setup lang="ts">
import type { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import type { TresRendererSetupContext } from "@tresjs/core";

import LoginScene from "#src/components/world/login/LoginScene.vue";
import { GAME_FONT_FAMILY } from "#src/services/interface/constants";
import { LOGIN_BEGIN_TEXT, LOGIN_FLASH_MS } from "#src/services/interface/login/constants";
import { TresCanvas } from "@tresjs/core";
import { createGenshinRenderer } from "genshin-engine";
import { PCFShadowMap } from "three";
import { unref } from "vue";

interface Props {
  // The scene alone, as the wiki's clean captures of it show it, for a reference to be scored against
  isInterfaceHidden?: true;
  timeOfDay: LoginTimeOfDay;
}

const { isInterfaceHidden, timeOfDay } = defineProps<Props>();
const emit = defineEmits<{ begin: []; ready: [] }>();
// The game's login screen: the scene of towers over a cloud sea under the sky of the player's hour, and its prompt
// Along the foot. A click begins: the screen fades into white, and `begin` says the white has come up
const isBegun = ref(false);
</script>

<template>
  <div class="login-screen" @click="isBegun = true">
    <TresCanvas
      :renderer="({ canvas }: TresRendererSetupContext) => createGenshinRenderer(unref(canvas))"
      shadows
      :shadow-map-type="PCFShadowMap"
    >
      <LoginScene :time-of-day @ready="emit('ready')" />
    </TresCanvas>
    <div v-if="!isInterfaceHidden" class="interface">
      <div class="begin-bar">
        <p class="begin-text">{{ LOGIN_BEGIN_TEXT }}</p>
      </div>
    </div>
    <div :class="['flash', { begun: isBegun }]" @transitionend="emit('begin')" />
  </div>
</template>

<style scoped>
/* Laid out on the game's 1920 by 1080 unit screen, scaled to fit the window's height or its width, whichever is less, as the game's interface is */
.login-screen {
  position: absolute;
  inset: 0;
  container-type: size;
  background: #000;
  cursor: pointer;
  font-family: v-bind(GAME_FONT_FAMILY);
}

.interface {
  --unit: min(100cqh / 1080, 100cqw / 1920);
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* The prompt's band across the foot, darker at its middle and gone at its ends */
.begin-bar {
  position: absolute;
  top: calc(50% + var(--unit) * 460);
  right: calc(var(--unit) * 150);
  left: calc(var(--unit) * 150);
  display: grid;
  height: calc(var(--unit) * 40);
  place-items: center;
  background: linear-gradient(90deg, transparent, rgb(0 0 0 / 0.35) 15%, rgb(0 0 0 / 0.35) 85%, transparent);
}

.begin-text {
  margin: 0;
  color: #fff;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: 1;
}

.flash {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity calc(v-bind(LOGIN_FLASH_MS) * 1ms) ease-in;
}

.begun {
  opacity: 1;
}
</style>
