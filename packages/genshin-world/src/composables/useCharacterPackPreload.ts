import { CharacterPackPreloadStatus } from "#src/models/character/CharacterPackPreloadStatus";
import { CHARACTER_PACK_CACHE_NAME } from "#src/services/character/constants";
import { downloadCharacterPackFiles } from "#src/services/character/downloadCharacterPackFiles";
import { listHeldCharacterPackUrls } from "#src/services/character/listHeldCharacterPackUrls";
import { planCharacterPackDownload } from "#src/services/character/planCharacterPackDownload";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";
import { getResultAsync, noop } from "@esposter/shared";
import { computed, ref } from "vue";

// The download of the published character packs: the index read, the files the browser's Cache lacks planned, and each
// Of those fetched into the cache with the bytes loaded and pending. `downloadProgress` is the share of those bytes
// Held, which the launch loading bar shows, and whole once every file is held. `onHeld` is called once every file is
// Held. Each call plans again, so the files already held are not fetched twice
export const useCharacterPackPreload = (gameDataBaseUrl: string, onHeld: () => void) => {
  const status = ref<CharacterPackPreloadStatus>(CharacterPackPreloadStatus.Idle);
  const loadedBytes = ref(0);
  const pendingBytes = ref(0);
  const downloadProgress = computed(() => {
    if (status.value === CharacterPackPreloadStatus.Ready) return 1;
    return pendingBytes.value > 0 ? loadedBytes.value / pendingBytes.value : 0;
  });
  const preload = async (): Promise<void> => {
    status.value = CharacterPackPreloadStatus.Downloading;
    loadedBytes.value = 0;
    pendingBytes.value = 0;
    await getResultAsync(async () => {
      const index = await readCharacterPackIndex(gameDataBaseUrl);
      const cache = await caches.open(CHARACTER_PACK_CACHE_NAME);
      // The cache lists its keys as absolute urls, so the plan's urls are made absolute the same way
      const absoluteGameDataBaseUrl = new URL(gameDataBaseUrl, window.location.href).href;
      const heldUrls = await listHeldCharacterPackUrls(cache);
      const plan = planCharacterPackDownload(index, absoluteGameDataBaseUrl, heldUrls);
      pendingBytes.value = plan.pendingBytes;
      await downloadCharacterPackFiles(cache, plan.files, (bytes) => {
        loadedBytes.value = bytes;
      }).match(noop, (error) => {
        throw error;
      });
    }).match(
      () => {
        status.value = CharacterPackPreloadStatus.Ready;
        onHeld();
      },
      (error) => {
        console.error(error);
        status.value = CharacterPackPreloadStatus.Failed;
      },
    );
  };
  return { downloadProgress, preload, status };
};
