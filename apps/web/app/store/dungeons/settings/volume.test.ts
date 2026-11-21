import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { useVolumeStore } from "#src/store/dungeons/settings/volume";
import { Direction } from "grid-engine-headless";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

describe(useVolumeStore, () => {
  const dungeonsStore = useDungeonsStore();
  beforeEach(() => {
    setActivePinia(createPinia());
    const settingsStore = useSettingsStore();
    settingsStore.settings = getInitialSettings();
    settingsStore.settings[SettingsOption.VolumePercentage] = 40;
    vi.mocked(dungeonsStore.saveDungeons).mockClear();
  });

  test("setVolume clamps the volume to the range it can take and saves it", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    volumeStore.setVolume(120);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(100);

    volumeStore.setVolume(-5);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(0);
    expect(dungeonsStore.saveDungeons).toHaveBeenCalledTimes(2);
  });

  test("a held direction changes the volume once per cooldown, not once per call", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    volumeStore.updateVolume(Direction.Left, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(39);

    volumeStore.updateVolume(Direction.Left, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(39);
  });

  test("right raises the volume and left lowers it, stopping at the bottom", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    settingsStore.settings[SettingsOption.VolumePercentage] = 0;
    volumeStore.updateVolume(Direction.Left, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(0);
    expect(dungeonsStore.saveDungeons).not.toHaveBeenCalled();

    volumeStore.updateVolume(Direction.Right, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(1);
  });

  test("right stops at the top of the volume range without saving", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    settingsStore.settings[SettingsOption.VolumePercentage] = 100;
    volumeStore.updateVolume(Direction.Right, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(100);
    expect(dungeonsStore.saveDungeons).not.toHaveBeenCalled();
  });

  test("up and down leave the volume alone", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    volumeStore.updateVolume(Direction.Up, 0);
    volumeStore.updateVolume(Direction.Down, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(40);
    expect(dungeonsStore.saveDungeons).not.toHaveBeenCalled();
  });

  test("lifting the key starts the next hold at once rather than waiting out the old cooldown", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    volumeStore.updateVolume(Direction.Left, 0);

    expect(volumeStore.checkIsUpdateVolume(Direction.Up, SettingsOption.VolumePercentage)).toBe(false);

    volumeStore.updateVolume(Direction.Left, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(38);
  });

  test("only left and right on the volume row count as a volume update", () => {
    expect.hasAssertions();

    const volumeStore = useVolumeStore();

    expect(volumeStore.checkIsUpdateVolume(Direction.Left, SettingsOption.VolumePercentage)).toBe(true);
    expect(volumeStore.checkIsUpdateVolume(Direction.Right, SettingsOption.VolumePercentage)).toBe(true);
    expect(volumeStore.checkIsUpdateVolume(Direction.Left, SettingsOption["Text Speed"])).toBe(false);
  });

  test("shutting the slider down destroys it and lets go of it, so a later volume change does not reach it", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    const destroy = vi.fn<() => void>();
    const slider = { destroy, value: 0.4 };
    volumeStore.volumeSlider = slider;
    volumeStore.destroyVolumeSlider();
    volumeStore.setVolume(70);

    expect(destroy).toHaveBeenCalledExactlyOnceWith();
    expect(slider.value).toBe(0.4);
    expect(volumeStore.volumeSlider).toBeUndefined();
    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(70);
  });
});
