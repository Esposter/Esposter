// @vitest-environment nuxt
import type { SceneWithPlugins } from "vue-phaserjs";

import { Save } from "#shared/models/dungeons/data/Save";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { createCaptureResult } from "@/services/dungeons/item/createCaptureResult";
import { CatchMonster } from "@/services/dungeons/state/battle/states/CatchMonster";
import { useDungeonsStore } from "@/store/dungeons";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { prettify } from "@/util/text/prettify";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { setState, showMessages } = vi.hoisted(() => ({
  setState: vi.fn<(stateName: StateName) => Promise<void>>(() => Promise.resolve()),
  showMessages: vi.fn<(scene: SceneWithPlugins, messages: string[]) => Promise<void>>(() => Promise.resolve()),
}));

// The state machine holds every battle state, and the dialog is UI over the scene, so only their calls are recorded
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed state machine has members this test never reads
vi.mock("@/services/dungeons/scene/battle/battleStateMachine", () => ({ battleStateMachine: { setState } }));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed store has members this test never reads
vi.mock("@/store/dungeons/battle/dialog", () => ({ useBattleDialogStore: () => ({ showMessages }) }));

// The ball's flight and the monster's fall are Phaser tweens, and the outcome the ball is thrown for is decided by the
// Capture roll, which is tested apart
vi.mock(import("@/composables/dungeons/item/useThrowBallAnimation"), () => ({
  useThrowBallAnimation: () => Promise.resolve(),
}));
vi.mock(import("@/composables/dungeons/scene/battle/monster/useMonsterDeathTween"), () => ({
  useMonsterDeathTween: () => Promise.resolve(),
}));
vi.mock(import("@/services/dungeons/item/createCaptureResult"), () => ({
  createCaptureResult: vi.fn<() => CaptureResult>(() => CaptureResult.Failure),
}));

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its save is read here, so
// The fake keeps the real save shape and holds one save for every reader
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const saveModule = await import("#shared/models/dungeons/data/Save");
  const { reactive } = await import("vue");
  const dungeonsStore = reactive({ dungeons: new Dungeons(), save: new saveModule.Save() });
  return { useDungeonsStore: () => dungeonsStore };
});

describe("CatchMonster", () => {
  const scene = {} as SceneWithPlugins;
  const wildMonsterName = prettify(MonsterKey.Iguanignite);

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    dungeonsStore.save = new Save();
    const enemyStore = useEnemyStore();
    enemyStore.activeMonster = new Monster(MonsterKey.Iguanignite);
    setState.mockClear();
    showMessages.mockClear();
  });

  test("a near miss says the capture almost worked before the monster breaks free", async () => {
    expect.hasAssertions();

    vi.mocked(createCaptureResult).mockReturnValueOnce(CaptureResult.NearMiss);
    await CatchMonster.onEnter?.(scene);

    expect(showMessages).toHaveBeenCalledWith(scene, [
      `You almost caught ${wildMonsterName}!`,
      `Wild ${wildMonsterName} breaks free!`,
    ]);
    expect(setState).toHaveBeenCalledWith(StateName.EnemyInput);
  });

  test("a failed capture only says the monster breaks free", async () => {
    expect.hasAssertions();

    vi.mocked(createCaptureResult).mockReturnValueOnce(CaptureResult.Failure);
    await CatchMonster.onEnter?.(scene);

    expect(showMessages).toHaveBeenCalledWith(scene, [`Wild ${wildMonsterName} breaks free!`]);
    expect(setState).toHaveBeenCalledWith(StateName.EnemyInput);
  });
});
