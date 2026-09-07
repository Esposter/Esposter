import { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";

type DialogMessageKey<TTypeKey extends string> =
  | `${TTypeKey}${TTypeKey extends "" ? "d" : "D"}ialogMessage`
  | `${TTypeKey}${TTypeKey extends "" ? "t" : "T"}extDisplayWidth`;

export const useDialogMessage = <TTypeKey extends string = "">(typeKey: string | TTypeKey = "") => {
  const dialogMessage = ref(new DialogMessage());
  const textDisplayWidth = ref<number>();
  return {
    [`${typeKey}${typeKey ? "D" : "d"}ialogMessage`]: dialogMessage,
    [`${typeKey}${typeKey ? "T" : "t"}extDisplayWidth`]: textDisplayWidth,
  } as {
    [P in DialogMessageKey<TTypeKey>]: P extends `${TTypeKey}${TTypeKey extends "" ? "d" : "D"}ialogMessage`
      ? typeof dialogMessage
      : P extends `${TTypeKey}${TTypeKey extends "" ? "t" : "T"}extDisplayWidth`
        ? typeof textDisplayWidth
        : never;
  };
};
