// @vitest-environment nuxt
import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { Direction } from "grid-engine";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { saveDungeons } = vi.hoisted(() => ({ saveDungeons: vi.fn<() => void>() }));

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its state and its save
// Are read here, so the fake keeps the real save shape and records each save
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const { reactive } = await import("vue");
  const dungeons = reactive(new Dungeons());
  return { useDungeonsStore: () => ({ dungeons, fadeSwitchToScene: vi.fn<() => void>(), saveDungeons }) };
});

describe(useVolumeStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const settingsStore = useSettingsStore();
    settingsStore.settings = getInitialSettings();
    settingsStore.settings[SettingsOption.VolumePercentage] = 40;
    saveDungeons.mockClear();
  });

  test("setVolume clamps the volume to the range it can take and saves it", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    await volumeStore.setVolume(120);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(100);

    await volumeStore.setVolume(-5);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(0);
    expect(saveDungeons).toHaveBeenCalledTimes(2);
  });

  test("a held direction changes the volume once per cooldown, not once per call", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    await volumeStore.updateVolume(Direction.LEFT, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(39);

    await volumeStore.updateVolume(Direction.LEFT, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(39);
  });

  test("right raises the volume and left lowers it, stopping at the bottom", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    settingsStore.settings[SettingsOption.VolumePercentage] = 0;
    await volumeStore.updateVolume(Direction.LEFT, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(0);
    expect(saveDungeons).not.toHaveBeenCalled();

    await volumeStore.updateVolume(Direction.RIGHT, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(1);
  });

  test("right stops at the top of the volume range without saving", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    settingsStore.settings[SettingsOption.VolumePercentage] = 100;
    await volumeStore.updateVolume(Direction.RIGHT, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(100);
    expect(saveDungeons).not.toHaveBeenCalled();
  });

  test("up and down leave the volume alone", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    await volumeStore.updateVolume(Direction.UP, 0);
    await volumeStore.updateVolume(Direction.DOWN, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(40);
    expect(saveDungeons).not.toHaveBeenCalled();
  });

  test("lifting the key starts the next hold at once rather than waiting out the old cooldown", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const volumeStore = useVolumeStore();
    await volumeStore.updateVolume(Direction.LEFT, 0);

    expect(volumeStore.checkIsUpdateVolume(Direction.UP, SettingsOption.VolumePercentage)).toBe(false);

    await volumeStore.updateVolume(Direction.LEFT, 0);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(38);
  });

  test("only left and right on the volume row count as a volume update", () => {
    expect.hasAssertions();

    const volumeStore = useVolumeStore();

    expect(volumeStore.checkIsUpdateVolume(Direction.LEFT, SettingsOption.VolumePercentage)).toBe(true);
    expect(volumeStore.checkIsUpdateVolume(Direction.RIGHT, SettingsOption.VolumePercentage)).toBe(true);
    expect(volumeStore.checkIsUpdateVolume(Direction.LEFT, SettingsOption["Text Speed"])).toBe(false);
  });
});
