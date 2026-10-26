import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { MenuInputResolver } from "@/models/resolvers/dungeons/menu/MenuInputResolver";
import { describe, expect, test, vi } from "vitest";

describe(MenuInputResolver, () => {
  const scene = {} as SceneWithPlugins;

  test("hands the input to the store it was given and returns its answer", () => {
    expect.hasAssertions();

    const onPlayerInput = vi.fn<(scene: SceneWithPlugins, justDownInput: PlayerInput) => boolean>(() => true);
    const useMenuStore = vi.fn<() => { onPlayerInput: typeof onPlayerInput }>(() => ({ onPlayerInput }));
    const isHandled = new MenuInputResolver(useMenuStore).handleInput(scene, PlayerSpecialInput.Confirm);

    expect(onPlayerInput).toHaveBeenCalledExactlyOnceWith(scene, PlayerSpecialInput.Confirm);
    expect(isHandled).toBe(true);
  });

  test("looks the store up only when input is handled, not at construction", () => {
    expect.hasAssertions();

    const useMenuStore = vi.fn<() => { onPlayerInput: () => boolean }>(() => ({ onPlayerInput: () => false }));
    const resolver = new MenuInputResolver(useMenuStore);

    expect(useMenuStore).not.toHaveBeenCalled();

    resolver.handleInput(scene, PlayerSpecialInput.Cancel);

    expect(useMenuStore).toHaveBeenCalledExactlyOnceWith();
  });
});
