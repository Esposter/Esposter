import type { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

// A sidebar section's open state, kept under its own key so the section reopens as the reader left it
export const useSidebarSectionOpen = (key: Extract<(typeof LocalStorageKey)[keyof typeof LocalStorageKey], string>) => {
  const isCollapsed = useLocalStorage<boolean>(key, false);
  return computed({
    get: () => !isCollapsed.value,
    set: (newIsOpen) => {
      isCollapsed.value = !newIsOpen;
    },
  });
};
