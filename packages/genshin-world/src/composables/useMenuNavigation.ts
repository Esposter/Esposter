import type { ScreenKind } from "#src/models/screen/ScreenKind";
import type { InputState } from "genshin-engine";
import type { Ref } from "vue";

import { MenuDirection } from "#src/models/menu/MenuDirection";
import {
  LIST_SCREEN_TAB_STEP_EVENT,
  MENU_FOCUSABLE_SELECTOR,
  MENU_PRESSED_ATTRIBUTE,
  MENU_REPEAT_DELAY_SECONDS,
  MENU_REPEAT_INTERVAL_SECONDS,
} from "#src/services/menu/constants";
import { findMenuFocusTarget } from "#src/services/menu/findMenuFocusTarget";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { useEventListener } from "@vueuse/core";
import { InputAction } from "genshin-engine";
import { INTERACTION_PRESS_MS } from "genshin-interface/constants";
import { watch } from "vue";

// The direction the directional pad or the stick holds, the axis held further winning, or undefined when both rest
const getMenuDirection = ({ menuDown, menuRight }: InputState): MenuDirection | undefined => {
  if (menuDown === 0 && menuRight === 0) return undefined;
  if (Math.abs(menuRight) >= Math.abs(menuDown)) return menuRight > 0 ? MenuDirection.Right : MenuDirection.Left;
  return menuDown > 0 ? MenuDirection.Down : MenuDirection.Up;
};

// The menus over the world, which are its held screens, are walked with the gamepad: its directional pad and left stick
// Move the focus to the nearest control that way, a held direction repeating at a steady pace. Its bumpers step the
// Tabs a list screen has, and its east face button presses the focused control, as the game binds Confirm. A menu
// Takes the focus as it opens, on its first control, unless one of its controls has it already
export const useMenuNavigation = ({
  inputState,
  root,
  screenKind,
}: {
  inputState: InputState;
  root: Readonly<Ref<HTMLElement | null>>;
  screenKind: Ref<ScreenKind>;
}) => {
  // Whether the last input was the pointer's, which a control focused for it draws no ring for
  let isPointerInput = false;
  // The direction the pad holds, the seconds it has been held and the time of its next repeat
  let heldDirection: MenuDirection | undefined;
  let heldSeconds = 0;
  let nextRepeatSeconds = 0;
  const checkIsMenuOpen = (): boolean => ScreenBehaviourMap[screenKind.value].isHeld;
  // A control inside an inert part of the page cannot take the focus, so it is left out
  const getFocusables = (): HTMLElement[] => {
    if (!root.value) return [];
    return Array.from(root.value.querySelectorAll<HTMLElement>(MENU_FOCUSABLE_SELECTOR)).filter(
      (element) => element.getClientRects().length > 0 && element.closest("[inert]") === null,
    );
  };
  const moveFocus = (direction: MenuDirection) => {
    const focusables = getFocusables();
    const focusedElement = window.document.activeElement;
    const fromIndex = focusables.findIndex((element) => element === focusedElement);
    if (fromIndex === -1) focusables[0]?.focus({ focusVisible: true });
    else {
      const targetIndex = findMenuFocusTarget(
        focusables.map((element) => element.getBoundingClientRect()),
        fromIndex,
        direction,
      );
      if (targetIndex !== undefined) focusables[targetIndex]?.focus({ focusVisible: true });
    }
  };
  // A click presses the focused control, as the keyboard's Enter does, so the pad's press and a pointer's share a path.
  // The press first shows the control's pressed look for its duration, and is dropped if its menu closes in that time
  // Or the control is pressed already
  const pressFocused = () => {
    const focusedElement = window.document.activeElement;
    if (
      focusedElement instanceof HTMLElement &&
      root.value?.contains(focusedElement) &&
      !focusedElement.hasAttribute(MENU_PRESSED_ATTRIBUTE)
    ) {
      focusedElement.setAttribute(MENU_PRESSED_ATTRIBUTE, "");
      window.setTimeout(() => {
        focusedElement.removeAttribute(MENU_PRESSED_ATTRIBUTE);
        if (focusedElement.isConnected && checkIsMenuOpen()) focusedElement.click();
      }, INTERACTION_PRESS_MS);
    }
  };
  watch(
    screenKind,
    () => {
      if (!checkIsMenuOpen() || root.value?.contains(window.document.activeElement)) return;
      getFocusables()[0]?.focus({ focusVisible: !isPointerInput });
    },
    { flush: "post" },
  );
  useEventListener("pointerdown", () => {
    isPointerInput = true;
  });
  useEventListener("keydown", () => {
    isPointerInput = false;
  });
  const stepMenuNavigation = (deltaSeconds: number) => {
    // The reads only the pad makes, its directions, its bumpers, its Confirm and the Start that opens the Paimon
    // Menu, make the last input the pad's
    const isPadInput =
      inputState.menuDown !== 0 ||
      inputState.menuRight !== 0 ||
      inputState.menuTabSteps !== 0 ||
      inputState.pressedActions.has(InputAction.Confirm) ||
      inputState.pressedActions.has(InputAction.OpenPaimonMenu);
    if (isPadInput) isPointerInput = false;
    if (!checkIsMenuOpen()) {
      heldDirection = undefined;
      return;
    }
    if (inputState.menuTabSteps !== 0)
      window.dispatchEvent(new CustomEvent(LIST_SCREEN_TAB_STEP_EVENT, { detail: inputState.menuTabSteps }));
    if (inputState.pressedActions.has(InputAction.Confirm)) pressFocused();
    const direction = getMenuDirection(inputState);
    if (direction === undefined) heldDirection = undefined;
    else if (direction !== heldDirection) {
      heldDirection = direction;
      heldSeconds = 0;
      nextRepeatSeconds = MENU_REPEAT_DELAY_SECONDS;
      moveFocus(direction);
    } else {
      heldSeconds += deltaSeconds;
      if (heldSeconds >= nextRepeatSeconds) {
        nextRepeatSeconds += MENU_REPEAT_INTERVAL_SECONDS;
        moveFocus(direction);
      }
    }
  };
  return { stepMenuNavigation };
};
