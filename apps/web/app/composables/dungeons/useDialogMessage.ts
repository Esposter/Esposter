import type { DialogMessageKey } from "#src/models/dungeons/UI/dialog/DialogMessageKey";

import { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";

export function useDialogMessage<TTypeKey extends string = "">(
  typeKey?: TTypeKey,
): {
  [P in DialogMessageKey<TTypeKey>]: P extends `${TTypeKey}${TTypeKey extends "" ? "d" : "D"}ialogMessage`
    ? Ref<DialogMessage>
    : P extends `${TTypeKey}${TTypeKey extends "" ? "t" : "T"}extDisplayWidth`
      ? Ref<number | undefined>
      : never;
};
export function useDialogMessage(typeKey = "") {
  const dialogMessage = ref(new DialogMessage());
  const textDisplayWidth = ref<number>();
  return {
    [`${typeKey}${typeKey ? "D" : "d"}ialogMessage`]: dialogMessage,
    [`${typeKey}${typeKey ? "T" : "t"}extDisplayWidth`]: textDisplayWidth,
  };
}
