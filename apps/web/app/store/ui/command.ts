import type { UiCommand } from "@/models/ui/UiCommand";
import type { UiCommandScope } from "@/models/ui/UiCommandScope";

// Every command the mounted surfaces offer, and the search scopes they bring. A surface registers while it is mounted
// And its entries leave with it, so the palette only offers what the page in front of the reader can do, and the
// Shortcuts dialog only lists keys that work there
export const useCommandStore = defineStore("ui/command", () => {
  const commandsGetters = shallowRef<(() => readonly UiCommand[])[]>([]);
  const commands = computed(() => commandsGetters.value.flatMap((getCommands) => getCommands()));
  const scopes = shallowRef<UiCommandScope[]>([]);
  // The surface mounted last is the one in front
  const scope = computed(() => scopes.value.at(-1));
  const isCommandPaletteOpen = ref(false);
  // Whether the palette searches the scope rather than the whole app. It opens in the scope whenever there is one
  const isScoped = ref(false);
  const isShortcutsDialogOpen = ref(false);
  const registerCommands = (getCommands: () => readonly UiCommand[]) => {
    commandsGetters.value = [...commandsGetters.value, getCommands];
    return () => {
      commandsGetters.value = commandsGetters.value.filter((commandsGetter) => commandsGetter !== getCommands);
    };
  };
  const registerScope = (newScope: UiCommandScope) => {
    scopes.value = [...scopes.value, newScope];
    return () => {
      scopes.value = scopes.value.filter((registeredScope) => registeredScope !== newScope);
    };
  };
  const openCommandPalette = () => {
    isScoped.value = Boolean(scope.value);
    isCommandPaletteOpen.value = true;
  };
  return {
    commands,
    isCommandPaletteOpen,
    isScoped,
    isShortcutsDialogOpen,
    openCommandPalette,
    registerCommands,
    registerScope,
    scope,
  };
});
