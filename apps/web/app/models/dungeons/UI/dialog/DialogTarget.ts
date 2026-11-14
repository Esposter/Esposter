import { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import { v7 } from "uuid";

export class DialogTarget {
  id = v7();
  inputPromptCursorX: MaybeRef<number> = ref(0);
  message = ref(new DialogMessage());

  constructor(init?: Partial<DialogTarget>) {
    Object.assign(this, init);
  }

  reset() {
    this.message.value = new DialogMessage();
  }
}
