import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { useVolumeStore } from "#src/store/dungeons/settings/volume";
import { Direction } from "grid-engine-headless";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
// A partial fake:
// oxlint-disable-next-line vitest/prefer-import-in-mock -- the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

describe(useVolumeStore, () => {
  const dungeonsStore = useDungeonsStore();
  const { saveDungeons } = dungeonsStore;
  beforeEach(() => {
    setActivePinia(createPinia());
    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    settings.value = getInitialSettings();
    settings.value[SettingsOption.VolumePercentage] = 40;
    vi.mocked(saveDungeons).mockClear();
  });

  test("setVolume clamps the volume to the range it can take and saves it", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    const volumeStore = useVolumeStore();
    const { setVolume } = volumeStore;
    setVolume(120);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(100);

    setVolume(-5);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(0);
    expect(saveDungeons).toHaveBeenCalledTimes(2);
  });

  test("a held direction changes the volume once per cooldown, not once per call", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    const volumeStore = useVolumeStore();
    const { updateVolume } = volumeStore;
    updateVolume(Direction.Left, 0);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(39);

    updateVolume(Direction.Left, 0);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(39);
  });

  test("right raises the volume and left lowers it, stopping at the bottom", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    const volumeStore = useVolumeStore();
    const { updateVolume } = volumeStore;
    settings.value[SettingsOption.VolumePercentage] = 0;
    updateVolume(Direction.Left, 0);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(0);
    expect(saveDungeons).not.toHaveBeenCalled();

    updateVolume(Direction.Right, 0);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(1);
  });

  test("right stops at the top of the volume range without saving", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    const volumeStore = useVolumeStore();
    const { updateVolume } = volumeStore;
    settings.value[SettingsOption.VolumePercentage] = 100;
    updateVolume(Direction.Right, 0);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(100);
    expect(saveDungeons).not.toHaveBeenCalled();
  });

  test("up and down leave the volume alone", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    const volumeStore = useVolumeStore();
    const { updateVolume } = volumeStore;
    updateVolume(Direction.Up, 0);
    updateVolume(Direction.Down, 0);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(40);
    expect(saveDungeons).not.toHaveBeenCalled();
  });

  test("lifting the key starts the next hold at once rather than waiting out the old cooldown", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    const volumeStore = useVolumeStore();
    const { checkIsUpdateVolume, updateVolume } = volumeStore;
    updateVolume(Direction.Left, 0);

    expect(checkIsUpdateVolume(Direction.Up, SettingsOption.VolumePercentage)).toBe(false);

    updateVolume(Direction.Left, 0);

    expect(settings.value[SettingsOption.VolumePercentage]).toBe(38);
  });

  test("only left and right on the volume row count as a volume update", () => {
    expect.hasAssertions();

    const volumeStore = useVolumeStore();
    const { checkIsUpdateVolume } = volumeStore;

    expect(checkIsUpdateVolume(Direction.Left, SettingsOption.VolumePercentage)).toBe(true);
    expect(checkIsUpdateVolume(Direction.Right, SettingsOption.VolumePercentage)).toBe(true);
    expect(checkIsUpdateVolume(Direction.Left, SettingsOption["Text Speed"])).toBe(false);
  });

  test("shutting the slider down destroys it and lets go of it, so a later volume change does not reach it", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    const volumeStore = useVolumeStore();
    const { volumeSlider } = storeToRefs(volumeStore);
    const { destroyVolumeSlider, setVolume } = volumeStore;
    const destroy = vi.fn<() => void>();
    const slider = { destroy, value: 0.4 };
    volumeSlider.value = slider;
    destroyVolumeSlider();
    setVolume(70);

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
    expect(slider.value).toBe(0.4);
    expect(volumeSlider.value).toBeUndefined();
    expect(settings.value[SettingsOption.VolumePercentage]).toBe(70);
  });
});
