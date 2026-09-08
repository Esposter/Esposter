import { KEY_CHORD_TIMEOUT_MS } from "@/services/resource/constants";
import { useNotificationStore } from "@/store/notification";
import { useSearchDialogStore } from "@/store/resource/searchDialog";
import { useShortcutsOverlayStore } from "@/store/resource/shortcutsOverlay";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { RoutePath } from "@esposter/shared";
// Azure-portal-style shortcuts: Ctrl+K / G-chords / ? — registered from the explorer home page
export const useResourceKeyboardShortcuts = () => {
  const searchDialogStore = useSearchDialogStore();
  const { isOpen: isSearchDialogOpen } = storeToRefs(searchDialogStore);
  const shortcutsOverlayStore = useShortcutsOverlayStore();
  const { isOpen: isShortcutsOverlayOpen } = storeToRefs(shortcutsOverlayStore);
  const notificationStore = useNotificationStore();
  const { isPanelOpen: isNotificationPanelOpen } = storeToRefs(notificationStore);
  let chordStartedAtMs = 0;

  useEventListener("keydown", async (event) => {
    const key = event.key.toLowerCase();

    if (event.ctrlKey || event.metaKey) {
      if (key === "k" && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        isSearchDialogOpen.value = true;
      }
    } else if (event.altKey || checkIsEditableTarget(event.target)) return;
    else if (event.shiftKey) {
      if (event.key === "?") isShortcutsOverlayOpen.value = true;
    } else if (key === "g") chordStartedAtMs = Date.now();
    // A chord only counts while the G that opened it is still recent
    else if (chordStartedAtMs && Date.now() - chordStartedAtMs <= KEY_CHORD_TIMEOUT_MS) {
      chordStartedAtMs = 0;
      if (key === "/") {
        event.preventDefault();
        isSearchDialogOpen.value = true;
      } else if (key === "a") await navigateTo(RoutePath.ResourceExplorerAll);
      else if (key === "n") isNotificationPanelOpen.value = true;
    }
  });
};
