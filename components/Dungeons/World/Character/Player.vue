<script setup lang="ts">
import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { onPreload } from "@/lib/phaser/hooks/onPreload";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { SoundEffectKey } from "@/models/dungeons/keys/sound/SoundEffectKey";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import { PlayerWalkingAnimationMapping } from "@/services/dungeons/scene/world/constants";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";
import { Cameras } from "phaser";

const playerStore = usePlayerStore();
const { player, isPlayerFainted } = storeToRefs(playerStore);
const playerWalkingDirection = computed(() =>
  player.value.direction === Direction.NONE ? Direction.DOWN : player.value.direction,
);
const worldPlayerStore = useWorldPlayerStore();
const { respawn, healParty } = worldPlayerStore;
const { sprite, isMoving } = storeToRefs(worldPlayerStore);
const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const worldDialogStore = useWorldDialogStore();
const { showMessages } = worldDialogStore;
// We only care about the starting frame, so we don't want this to be reactive
const frame = ref(PlayerWalkingAnimationMapping[playerWalkingDirection.value].standing);

onPreload((scene) => {
  if (!isPlayerFainted.value) return;

  respawn();
  scene.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
    healParty();
    showMessages(scene, [
      { title: "???", text: "It looks like your team put up quite a fight..." },
      { title: "???", text: "I went ahead and healed them up for you." },
    ]);
  });
});

usePhaserListener("teleport", (position) => {
  player.value.position = position;
  frame.value = PlayerWalkingAnimationMapping[playerWalkingDirection.value].standing;
});

onShutdown((scene) => {
  scene.cameras.main.stopFollow();
});
</script>

<template>
  <!-- The character is keyed to the tilemap so grid engine knows to re-render the player
    and regenerate the player grid metadata everytime the tilemap changes -->
  <DungeonsWorldCharacter
    :id="CharacterId.Player"
    :key="tilemapKey"
    v-model:position="player.position"
    v-model:direction="player.direction"
    :sprite-configuration="{ texture: SpritesheetKey.Character, frame }"
    :walking-animation-mapping="PlayerWalkingAnimationMapping"
    :on-movement-started="
      () => {
        isMoving = true;
      }
    "
    :on-movement-stopped="
      () => {
        isMoving = false;
      }
    "
    :on-position-change-finished="
      (scene, { enterTile }) => {
        const tile = ExternalWorldSceneStore.tilemapKeyLayerMap
          .get(tilemapKey)
          ?.get(LayerName.Encounter)
          ?.getTileAt(enterTile.x, enterTile.y, false);
        if (!tile) return;

        getDungeonsSoundEffect(scene, SoundEffectKey.StepGrass).play();
        useRandomEncounter(scene);
      }
    "
    :on-complete="
      (scene, newSprite) => {
        sprite = newSprite;
        scene.cameras.main.startFollow(sprite, true);
        scene.cameras.main.setFollowOffset(-sprite.width, -sprite.height);
      }
    "
  />
</template>
