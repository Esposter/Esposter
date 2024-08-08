import { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";

export class DialogTarget {
  id = crypto.randomUUID();
  inputPromptCursorX: MaybeRef<number> = ref(0);
  message = ref(new DialogMessage());

  constructor(init?: Partial<DialogTarget>) {
    Object.assign(this, init);
  }

  reset() {
    this.message.value = new DialogMessage();
  }

  setMessage(message: DialogMessage) {
    this.message.value = message;
  }
}
