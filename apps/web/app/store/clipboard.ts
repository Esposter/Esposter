import { getResultAsync, noop } from "@esposter/shared";
import { skipHydrate } from "pinia";

// One clipboard for the app, so one snackbar reports every copy from `app.vue`. A confirmation mounted where the
// Copy happens is a `v-snackbar` per webhook row, per dialog, per message pane — each an overlay that is idle
// Almost always, and each free to disagree with the others about what was last copied. It is its own store
// Rather than the `message` one, so copying a webhook or a user id borrows no messaging state
export const useClipboardStore = defineStore("clipboard", () => {
  const { copied, copy: writeClipboard, text } = useClipboard();
  // Every caller is a click handler that awaits nothing, and the write is refusable — a denied permission, a
  // Document that is not focused — so the rejection is terminated here rather than at each of them. `copied`
  // Stays false on a refusal, which is what keeps the snackbar from announcing a copy that never happened
  const copy = async (value: string) => {
    await getResultAsync(() => writeClipboard(value)).match(noop, console.error);
  };
  // Copied/text are readonly refs, so they cannot be written to by pinia's SSR payload hydration
  return {
    copied: skipHydrate(copied),
    copy,
    text: skipHydrate(text),
  };
});
