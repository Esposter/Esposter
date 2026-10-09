import type { ClickerItemProperties } from "@/models/clicker/ClickerItemProperties";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { ClickerColorMap } from "@/services/clicker/properties/ClickerColorMap";
import { ClickerIconComponentMap } from "@/services/clicker/properties/ClickerIconComponentMap";
import { ClickerNameMap } from "@/services/clicker/properties/ClickerNameMap";
import { ClickerPluralNameMap } from "@/services/clicker/properties/ClickerPluralNameMap";
import { toClickerSave } from "@/services/clicker/save/toClickerSave";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { checkIsTRPCConflict } from "@/services/trpc/checkIsTRPCConflict";
import { getResultAsync } from "@esposter/shared";

export const useClickerStore = defineStore("clicker", () => {
  const { $trpc } = useNuxtApp();
  const clicker = ref(new Clicker());
  // The etag of the save the page last read or wrote, which its next save is sent under
  let clickerEtag: string | undefined;
  // Persist ids and counters only (the `ClickerSave` shape) so content rebalances reach existing saves
  const { save: saveClicker, setState: setClickerState } = useSave(clicker, {
    auth: {
      save: (clickerSave) =>
        getResultAsync(() => $trpc.clicker.saveClicker.mutate({ data: clickerSave, etag: clickerEtag })).match(
          ({ etag }) => {
            clickerEtag = etag;
          },
          (error) => {
            // Another session wrote the save since it was read, so the page reloads and takes the server's copy
            if (checkIsTRPCConflict(error)) window.location.reload();
            else throw error;
          },
        ),
    },
    toSave: toClickerSave,
    unauth: { key: LocalStorageKey.ClickerStore, schema: clickerSaveSchema },
  });
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    color: ClickerColorMap[clicker.value.type],
    iconComponent: ClickerIconComponentMap[clicker.value.type],
    name: ClickerNameMap[clicker.value.type],
    pluralName: ClickerPluralNameMap[clicker.value.type],
  }));
  // Loading a save takes the etag it was read under, which the next save is sent under
  const setClicker = (newClicker: Clicker, etag?: string) => {
    clickerEtag = etag;
    setClickerState(newClicker);
  };
  return { clicker, clickerItemProperties, saveClicker, setClicker };
});
