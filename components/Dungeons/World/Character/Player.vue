<script setup lang="ts">
import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { usePhaserListener } from "@/lib/phaser/composables/usePhaserListener";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onNextTick } from "@/lib/phaser/hooks/onNextTick";
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
const sceneKey = useInjectSceneKey();
// We only care about the starting frame, so we don't want this to be reactive
const frame = ref(PlayerWalkingAnimationMapping[playerWalkingDirection.value].standing);

onCreate((scene) => {
  if (!isPlayerFainted.value) return;

  respawn();
  scene.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, async () => {
    healParty();
    await showMessages(scene, [
      { title: "???", text: "It looks like your team put up quite a fight..." },
      { title: "???", text: "I went ahead and healed them up for you." },
    ]);
  });
});

usePhaserListener("playerTeleport", (position, direction) => {
  onNextTick((scene) => {
    // We need to let the grid engine handle setting the player position instead
    scene.gridEngine.setPosition(CharacterId.Player, position);
    if (direction) player.value.direction = direction;
    frame.value = PlayerWalkingAnimationMapping[playerWalkingDirection.value].standing;
  }, sceneKey);
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
