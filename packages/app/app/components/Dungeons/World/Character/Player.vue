<script setup lang="ts">
import { LayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import { PlayerWalkingAnimationMapping } from "@/services/dungeons/scene/world/constants";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";
import { Cameras } from "phaser";
import { onCreate, onNextTick, onShutdown, useInjectSceneKey } from "vue-phaserjs";

const playerStore = usePlayerStore();
const { player } = storeToRefs(playerStore);
const monsterPartySceneStore = useMonsterPartySceneStore();
const { isPlayerFainted } = storeToRefs(monsterPartySceneStore);
const playerWalkingDirection = computed(() =>
  player.value.direction === Direction.NONE ? Direction.DOWN : player.value.direction,
);
const worldPlayerStore = useWorldPlayerStore();
const { healParty, respawn } = worldPlayerStore;
const { isMoving, sprite } = storeToRefs(worldPlayerStore);
const worldSceneStore = useWorldSceneStore();
const { layerMap, tilemapKey } = storeToRefs(worldSceneStore);
const worldDialogStore = useWorldDialogStore();
const { showMessages } = worldDialogStore;
const sceneKey = useInjectSceneKey();
// We only care about the starting frame, so we don't want this to be computed and have it be manually changed as required
const frame = ref(PlayerWalkingAnimationMapping[playerWalkingDirection.value].standing);

onCreate(
  getSynchronizedFunction(async (scene) => {
    if (!isPlayerFainted.value) return;

    await respawn();
    scene.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, async () => {
      healParty();
      await showMessages(scene, [
        { text: "It looks like your team put up quite a fight...", title: "???" },
        { text: "I went ahead and healed them up for you.", title: "???" },
      ]);
    });
  }),
);

usePhaserListener("playerTeleport", (position, direction) => {
  onNextTick((scene) => {
    // Don't set player position manually and let grid engine set the player position
    // This will help us detect errors if we're trying to teleport the player
    // before the tilemap has been properly initialized when we're changing the tilemap key
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
        const tile = layerMap?.get(LayerName.Encounter)?.getTileAt(enterTile.x, enterTile.y, false);
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
