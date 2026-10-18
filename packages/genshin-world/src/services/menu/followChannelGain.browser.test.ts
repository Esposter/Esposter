import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { GENSHIN_SETTINGS_DEFAULTS, GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { followChannelGain } from "#src/services/menu/followChannelGain";
import { useLocalStorage } from "@vueuse/core";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { effectScope, nextTick } from "vue";

describe(followChannelGain, () => {
  let context: AudioContext;
  let scope: ReturnType<typeof effectScope>;

  beforeEach(() => {
    context = new AudioContext();
    scope = effectScope();
  });

  afterEach(async () => {
    scope.stop();
    localStorage.removeItem(GENSHIN_SETTINGS_STORAGE_KEY);
    await context.close();
  });

  test("a volume changed while the music plays is heard at once", async () => {
    expect.hasAssertions();

    const bus = new GainNode(context);
    scope.run(() => followChannelGain(bus, VolumeSetting.Music));
    // The Settings screen writes through its own ref, which the bus hears as a change made on this device
    const settings = useLocalStorage(GENSHIN_SETTINGS_STORAGE_KEY, GENSHIN_SETTINGS_DEFAULTS, {
      listenToStorageChanges: false,
      writeDefaults: false,
    });
    settings.value = { ...GENSHIN_SETTINGS_DEFAULTS, musicVolume: 4 };
    await nextTick();

    // A gain is held as a 32-bit float, so the level is compared to its precision
    expect(bus.gain.value).toBeCloseTo(0.4);
  });

  test("a volume changed in another tab is heard at once", async () => {
    expect.hasAssertions();

    const bus = new GainNode(context);
    scope.run(() => followChannelGain(bus, VolumeSetting.Music));
    const storedSettings = JSON.stringify({ ...GENSHIN_SETTINGS_DEFAULTS, volume: 5 });
    localStorage.setItem(GENSHIN_SETTINGS_STORAGE_KEY, storedSettings);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: GENSHIN_SETTINGS_STORAGE_KEY,
        newValue: storedSettings,
        storageArea: localStorage,
      }),
    );
    await nextTick();

    expect(bus.gain.value).toBeCloseTo(0.5);
  });
});
