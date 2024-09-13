<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { CONTENT_MENU_WIDTH, INITIAL_CURSOR_POSITION } from "@/services/dungeons/scene/inventory/constants";
import { Input } from "phaser";
import { Rectangle } from "vue-phaser";

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <Rectangle
    :configuration="{
      origin: 0,
      width: CONTENT_MENU_WIDTH,
      height: MenuTextStyle.fontSize,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="emit('click')"
  />
  <DungeonsText
    :configuration="{
      x: INITIAL_CURSOR_POSITION.x + 20,
      text: PlayerSpecialInput.Cancel,
      style: MenuTextStyle,
    }"
  />
</template>
