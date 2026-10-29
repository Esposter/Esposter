import { CharacterPackPreloadStatus } from "#src/models/character/CharacterPackPreloadStatus";
import { CHARACTER_PACK_CACHE_NAME } from "#src/services/character/constants";
import { downloadCharacterPackFiles } from "#src/services/character/downloadCharacterPackFiles";
import { listHeldCharacterPackUrls } from "#src/services/character/listHeldCharacterPackUrls";
import { planCharacterPackDownload } from "#src/services/character/planCharacterPackDownload";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";
import { getResultAsync, noop } from "@esposter/shared";
import { onMounted, ref } from "vue";

// The download of the published character packs, started when the host mounts: the index read, the files the browser's
// Cache lacks planned, and each of those fetched into the cache with the bytes loaded and pending that the loading
// Screen shows, and `onHeld` is called once every file is held. A retry plans again, so the files already held are not fetched twice
export const useCharacterPackPreload = (gameDataBaseUrl: string, onHeld: () => void) => {
  const status = ref(CharacterPackPreloadStatus.Idle);
  const loadedBytes = ref(0);
  const pendingBytes = ref(0);
  const preload = async (): Promise<void> => {
    status.value = CharacterPackPreloadStatus.Downloading;
    loadedBytes.value = 0;
    pendingBytes.value = 0;
    await getResultAsync(async () => {
      const index = await readCharacterPackIndex(gameDataBaseUrl);
      const cache = await caches.open(CHARACTER_PACK_CACHE_NAME);
      // The cache lists its keys as absolute urls, so the plan's urls are made absolute the same way
      const absoluteGameDataBaseUrl = new URL(gameDataBaseUrl, location.href).href;
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
  onMounted(preload);
  return { loadedBytes, pendingBytes, retry: preload, status };
};
