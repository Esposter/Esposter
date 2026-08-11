import { skipHydrate } from "pinia";

// One clipboard for the app, so one snackbar can report every copy from `app.vue`. Before this, the confirmation
// Was mounted wherever the copy happened — a `v-snackbar` per webhook row, per dialog, per message pane — each an
// Overlay that is idle almost always, and each free to disagree with the others about what was last copied.
// It lived on the `message` store, which meant a webhook or a user id borrowed messaging state to be copied
export const useClipboardStore = defineStore("clipboard", () => {
  const { copied, copy, text } = useClipboard();
  // Copied/text are readonly refs, so they cannot be written to by pinia's SSR payload hydration
  return {
    copied: skipHydrate(copied),
    copy,
    text: skipHydrate(text),
  };
});
