import type { MaybeRefOrGetter } from "vue";

import { nextTick, toValue, useTemplateRef, watch } from "vue";

// A dialog or button the keyboard's focus moves to through its own `focus`, as the Confirm and the GameButton expose it
interface FocusTarget {
  focus: () => void;
}

/**
 * The bag's destroy dialog takes the focus as it opens, the bag behind it inert until it closes so nothing behind it
 * changes what OK Destroys, and the focus goes back to what held it once it closes, or to the trash where a confirmed
 * destroy closed the Destroy mode and its Destroy button with it
 */
export const useDestroyFocus = (isConfirming: MaybeRefOrGetter<boolean>) => {
  // The template binds the dialog as `ref="confirm"` and the trash as `ref="trashButton"`
  const confirm = useTemplateRef<FocusTarget>("confirm");
  const trashButton = useTemplateRef<FocusTarget>("trashButton");
  let returnFocus: HTMLElement | undefined;
  watch(
    () => toValue(isConfirming),
    async (isOpen) => {
      if (isOpen)
        returnFocus = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : undefined;
      await nextTick();
      if (isOpen) confirm.value?.focus();
      else (returnFocus?.isConnected ? returnFocus : trashButton.value)?.focus();
    },
  );
};
