import type { Controls } from "@/models/dungeons/input/Controls";

import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { TextSpeedSetting } from "#shared/models/dungeons/data/settings/TextSpeedSetting";
import { useSettingsOnGridClick } from "@/composables/dungeons/scene/settings/useSettingsOnGridClick";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useControlsStore } from "@/store/dungeons/controls";
import { useSettingsStore } from "@/store/dungeons/settings";
import { NotFoundError } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { saveDungeons } = vi.hoisted(() => ({ saveDungeons: vi.fn<() => void>() }));

// Only the store's state and its save are read here, so the fake keeps the real save shape and records each save
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const { reactive } = await import("vue");
  const dungeons = reactive(new Dungeons());
  return { useDungeonsStore: () => ({ dungeons, fadeSwitchToScene: vi.fn<() => void>(), saveDungeons }) };
});

const getRowPosition = (settingsOption: SettingsOption) => {
  const position = SettingsOptionGrid.getPosition(settingsOption);
  if (!position) throw new NotFoundError(getRowPosition.name, settingsOption);

  return position;
};

describe(useSettingsOnGridClick, () => {
  let controls: Controls;

  beforeEach(() => {
    setActivePinia(createPinia());
    controls = { setInput: vi.fn<(input: PlayerSpecialInput) => void>() } as unknown as Controls;
    const controlsStore = useControlsStore();
    controlsStore.controls = controls;
    const settingsStore = useSettingsStore();
    settingsStore.settings = getInitialSettings();
  });

  // A value cell saves on the press that lands on it, so the cell being held means the save already happened
  test("a second press on a value cell saves nothing and confirms nothing", () => {
    expect.hasAssertions();

    const textSpeedRow = getRowPosition(SettingsOption["Text Speed"]);
    const fastCell = {
      x: SettingsOptionGrid.getPositionX(TextSpeedSetting.Fast, textSpeedRow.y) ?? 0,
      y: textSpeedRow.y,
    };
    SettingsOptionGrid.position.value = fastCell;
    useSettingsOnGridClick(fastCell)();

    expect(saveDungeons).not.toHaveBeenCalled();
    expect(controls.setInput).not.toHaveBeenCalled();
  });

  test("a second press on Close confirms and saves nothing", () => {
    expect.hasAssertions();

    const closeRow = getRowPosition(SettingsOption.Close);
    SettingsOptionGrid.position.value = closeRow;
    useSettingsOnGridClick(closeRow)();

    expect(controls.setInput).toHaveBeenCalledExactlyOnceWith(PlayerSpecialInput.Confirm);
    expect(saveDungeons).not.toHaveBeenCalled();
  });
});
