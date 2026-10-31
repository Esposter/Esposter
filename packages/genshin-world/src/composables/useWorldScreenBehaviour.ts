import type { Input } from "genshin-engine";
import type { Ref } from "vue";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { useEventListener } from "@vueuse/core";
import { computed, watch } from "vue";

// The screen open over the world sets the pointer and the keys: a screen with a cursor of its own lets the pointer go,
// A screen's change spends the press that closed it, and a lock lost in play opens the Paimon menu.
export const useWorldScreenBehaviour = ({
  closeFishing,
  input,
  screenKind,
}: {
  closeFishing: () => void;
  input: Input;
  screenKind: Ref<ScreenKind>;
}) => {
  const screenBehaviour = computed(() => ScreenBehaviourMap[screenKind.value]);
  // A screen with a cursor of its own lets the pointer go, which a click on the world takes again once it closes
  watch(
    () => screenBehaviour.value.isPointerReleased,
    (isPointerReleased) => {
      if (isPointerReleased) window.document.exitPointerLock();
    },
  );
  // The press that closes a screen is spent with it, so the F, Space or click that ended it never reaches the world as an
  // Interact, a jump or an attack
  watch(screenKind, (newScreenKind) => {
    if (newScreenKind !== ScreenKind.Fishing) closeFishing();
    if (newScreenKind === ScreenKind.World) input.readInput(0);
  });
  // Left Alt shows the cursor, as the game's Show Cursor does, letting the lock go without opening the Paimon menu
  let isCursorShown = false;
  const showCursor = () => {
    isCursorShown = true;
    window.document.exitPointerLock();
  };
  // The browser keeps Escape for itself while the pointer is locked, letting the lock go in place of passing the key on,
  // So a lock lost with the world in play opens the Paimon menu as Escape does, unless it was let go to show the cursor
  useEventListener(
    () => window.document,
    "pointerlockchange",
    () => {
      if (window.document.pointerLockElement !== null) isCursorShown = false;
      else if (screenKind.value === ScreenKind.World && !isCursorShown) screenKind.value = ScreenKind.PaimonMenu;
    },
  );
  return { screenBehaviour, showCursor };
};
