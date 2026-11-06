import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { props } from "#src/components/World/Screen/Index.fixture";
import WorldScreen from "#src/components/World/Screen/Index.vue";
import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { SCRIPTED_FRAME_LIMIT } from "#src/services/dev/constants";
import { createScriptedClock } from "#src/services/dev/createScriptedClock.fixture";
import { settleScriptedSession } from "#src/services/dev/settleScriptedSession";
import { stepFramesUntil } from "#src/services/dev/stepFramesUntil";
import { createPinia } from "pinia";
import { render } from "vitest-browser-vue";
import { z } from "zod";

// The browser driver of a scripted session, which implements the runner's driver over one world screen and its registry:
// It mounts the screen, steps the frame clock, saves the world's last save through the save schema and mounts a fresh
// Screen from the saved blob. The session's commands join the registry while a screen is mounted and leave it once the
// Screen unmounts
export const createSessionDriver = (devRegistry: DevRegistry) => {
  // Taken before the clock is faked, so a real frame still comes between two scripted frames, for a worker to answer in
  const requestRealFrame = window.requestAnimationFrame.bind(window);
  const scriptedClock = createScriptedClock();
  let isWorldReady = false;
  let lastSave: GenshinSave | undefined;
  let savedSave: GenshinSave | undefined;
  let unmountScreen: (() => Promise<void>) | undefined;

  // One scripted frame, then one real frame, so the worker's answers land between two frames
  const frame = async () => {
    scriptedClock.stepFrame();
    await new Promise<void>((resolve) => {
      requestRealFrame(() => {
        resolve();
      });
    });
  };
  const checkIsReady = () => isWorldReady && lastSave !== undefined;
  const unmount = async () => {
    await unmountScreen?.();
    unmountScreen = undefined;
  };
  // Mounts the world screen on the registry from the save given, or a new player's, and steps frames until the world is
  // Ready and has emitted its first save: the quests load after the screen is up, and that load is the first change a save takes
  const mount = async (save?: GenshinSave): Promise<ScriptedSessionOutcome> => {
    isWorldReady = false;
    lastSave = undefined;
    const screen = await render(WorldScreen, {
      attrs: {
        onReady: () => {
          isWorldReady = true;
        },
        onSave: (newSave: GenshinSave) => {
          lastSave = newSave;
        },
      },
      global: { plugins: [createPinia()] },
      props: { ...props, devRegistry, save },
    });
    unmountScreen = () => screen.unmount();
    const isReady = await stepFramesUntil<true>(frame, () => (checkIsReady() ? true : undefined));
    if (isReady) return { ok: true };

    return { error: `the world is not ready after ${SCRIPTED_FRAME_LIMIT} frames`, ok: false };
  };
  // Settles, then takes the world's last save through JSON and the save schema, and unmounts the screen whatever the
  // Outcome. A save the schema refuses fails with the schema's own message
  const save = async (): Promise<ScriptedSessionOutcome> => {
    try {
      const settled = await settleScriptedSession(driver);
      if (!settled.ok) return settled;

      const emittedSave = lastSave;
      if (emittedSave === undefined) return { error: "the world has emitted no save", ok: false };

      const parsedResult = genshinSaveSchema.safeParse(JSON.parse(JSON.stringify(emittedSave)));
      if (!parsedResult.success) return { error: z.prettifyError(parsedResult.error), ok: false };

      savedSave = parsedResult.data;
      return { ok: true };
    } finally {
      await unmount();
    }
  };
  // Mounts a fresh screen on the same registry, from the blob the last save parsed
  const load = async (): Promise<ScriptedSessionOutcome> => {
    if (savedSave === undefined) return { error: "nothing has been saved", ok: false };

    return mount(savedSave);
  };
  const dispose = async () => {
    await unmount();
    scriptedClock.dispose();
  };
  // The runner's driver, typed by its interface so a change to the interface reaches this implementation at compile time
  const driver: ScriptedSessionDriver = { frame, load, run: devRegistry.run, save };

  return { ...driver, dispose, mount };
};
