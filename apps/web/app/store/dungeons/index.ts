import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { checkIsTRPCConflict } from "@/services/trpc/checkIsTRPCConflict";
import { getResultAsync, noop } from "@esposter/shared";
import { Cameras } from "phaser";
import { useCameraStore, usePhaserStore } from "vue-phaserjs";

export const useDungeonsStore = defineStore("dungeons", () => {
  const { $trpc } = useNuxtApp();
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;

  const dungeons = ref(new Dungeons());
  // The etag of the save the page last read or wrote, which its next save is sent under
  let dungeonsEtag: string | undefined;
  const { save: saveDungeons, setState: setDungeonsState } = useSave(dungeons, {
    auth: {
      save: (dungeonsValue) =>
        getResultAsync(() => $trpc.dungeons.saveDungeons.mutate({ data: dungeonsValue, etag: dungeonsEtag })).match(
          ({ etag }) => {
            dungeonsEtag = etag;
          },
          (error) => {
            // Another session wrote the save since it was read, so the page reloads and takes the server's copy
            if (checkIsTRPCConflict(error)) window.location.reload();
            else throw error;
          },
        ),
    },
    unauth: { key: LocalStorageKey.DungeonsStore, schema: dungeonsSchema },
  });
  // Loading a save takes the etag it was read under, which the next save is sent under
  const setDungeons = (newDungeons: Dungeons, etag?: string) => {
    dungeonsEtag = etag;
    setDungeonsState(newDungeons);
  };

  const save = ref(new Save());
  const saveData = async () => {
    dungeons.value.save = save.value;
    await saveDungeons();
  };

  const fadeSwitchToScene = (
    scene: SceneWithPlugins,
    sceneKey: SceneKey,
    durationMs = Temporal.Duration.from({ seconds: 1 }).total("milliseconds"),
  ) => {
    fadeOut(scene, durationMs);
    // Phaser calls its listener and drops what it returns, and the switch can reject — a fade that completes
    // After the game has gone finds no game to start the next scene on. Terminating here is what turns that
    // Into a line on the console rather than a screen left faded out with nothing behind it
    scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
      getResultAsync(() => switchToScene(sceneKey)).match(noop, console.error),
    );
  };

  return { dungeons, fadeSwitchToScene, save, saveData, saveDungeons, setDungeons };
});
