import type { SceneWithPlugins } from "vue-phaserjs";

import { AnimationsSetting } from "#shared/models/dungeons/data/settings/AnimationsSetting";
import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { TextSpeedSetting } from "#shared/models/dungeons/data/settings/TextSpeedSetting";
import { getRowPosition } from "#src/store/dungeons/settings/getRowPosition.test";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";
import { Direction } from "grid-engine";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { saveDungeons } = vi.hoisted(() => ({ saveDungeons: vi.fn<() => void>() }));

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its state and its save
// Are read here, so the fake keeps the real save shape and records each save
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const { reactive } = await import("vue");
  const dungeons = reactive(new Dungeons());
  return { useDungeonsStore: () => ({ dungeons, fadeSwitchToScene: vi.fn<() => void>(), saveDungeons }) };
});

describe(useSettingsSceneStore, () => {
  // The scene is only read for special inputs, which these tests never send
  const scene = {} as SceneWithPlugins;

  beforeEach(() => {
    setActivePinia(createPinia());
    const settingsStore = useSettingsStore();
    settingsStore.settings = getInitialSettings();
    const settingsSceneStore = useSettingsSceneStore();
    const { settingsOptionGrid } = settingsSceneStore;
    settingsOptionGrid.position.value = { x: 0, y: 0 };
  });

  // Selecting the Volume row once saved its empty value, which made the volume non-finite and the save fail
  test("selecting the volume row saves no value", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    settingsStore.settings[SettingsOption.VolumePercentage] = 40;
    const settingsSceneStore = useSettingsSceneStore();
    const { selectSettingsPosition, settingsOptionGrid } = settingsSceneStore;
    const volumeRow = getRowPosition(settingsOptionGrid, SettingsOption.VolumePercentage);
    selectSettingsPosition(volumeRow);

    expect(settingsStore.settings[SettingsOption.VolumePercentage]).toBe(40);
    expect(settingsOptionGrid.position.value).toStrictEqual(volumeRow);
    expect(saveDungeons).not.toHaveBeenCalled();
  });

  test("left and right step through a row's values, saving each one they land on", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const settingsSceneStore = useSettingsSceneStore();
    const { onPlayerInput, restSettingsCursor } = settingsSceneStore;
    settingsStore.settings[SettingsOption["Text Speed"]] = TextSpeedSetting.Mid;
    restSettingsCursor();
    onPlayerInput(scene, Direction.RIGHT, Direction.RIGHT, 0);

    expect(settingsStore.settings[SettingsOption["Text Speed"]]).toBe(TextSpeedSetting.Fast);
    // Past the last value, right changes nothing and saves nothing
    onPlayerInput(scene, Direction.RIGHT, Direction.RIGHT, 0);

    expect(settingsStore.settings[SettingsOption["Text Speed"]]).toBe(TextSpeedSetting.Fast);
    onPlayerInput(scene, Direction.LEFT, Direction.LEFT, 0);
    onPlayerInput(scene, Direction.LEFT, Direction.LEFT, 0);

    expect(settingsStore.settings[SettingsOption["Text Speed"]]).toBe(TextSpeedSetting.Slow);
    // Mid to Fast, Fast to Mid, Mid to Slow: the edge press is not one of the three
    expect(saveDungeons).toHaveBeenCalledTimes(3);
  });

  test("up and down rest on each row's saved value and save nothing", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const settingsSceneStore = useSettingsSceneStore();
    const { onPlayerInput, restSettingsCursor, settingsOptionGrid } = settingsSceneStore;
    settingsStore.settings[SettingsOption.Animations] = AnimationsSetting.Off;
    restSettingsCursor();
    onPlayerInput(scene, Direction.DOWN, Direction.DOWN, 0);

    const animationsRow = getRowPosition(settingsOptionGrid, SettingsOption.Animations);
    expect(settingsOptionGrid.position.value).toStrictEqual({
      x: settingsOptionGrid.getPositionX(AnimationsSetting.Off, animationsRow.y),
      y: animationsRow.y,
    });
    expect(settingsStore.settings[SettingsOption.Animations]).toBe(AnimationsSetting.Off);
    expect(settingsStore.settings[SettingsOption["Text Speed"]]).toBe(TextSpeedSetting.Mid);
    expect(saveDungeons).not.toHaveBeenCalled();
  });

  test("clicking a value saves it, and clicking a name only moves to its row", () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const settingsSceneStore = useSettingsSceneStore();
    const { selectSettingsPosition, settingsOptionGrid } = settingsSceneStore;
    const textSpeedRow = getRowPosition(settingsOptionGrid, SettingsOption["Text Speed"]);
    selectSettingsPosition({
      x: settingsOptionGrid.getPositionX(TextSpeedSetting.Fast, textSpeedRow.y) ?? 0,
      y: textSpeedRow.y,
    });

    expect(settingsStore.settings[SettingsOption["Text Speed"]]).toBe(TextSpeedSetting.Fast);
    selectSettingsPosition({ x: 0, y: textSpeedRow.y });

    expect(settingsStore.settings[SettingsOption["Text Speed"]]).toBe(TextSpeedSetting.Fast);
    expect(settingsOptionGrid.position.value.x).toBe(
      settingsOptionGrid.getPositionX(TextSpeedSetting.Fast, textSpeedRow.y),
    );
    expect(saveDungeons).toHaveBeenCalledTimes(1);
  });
});
