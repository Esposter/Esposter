import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { useInputStore } from "vue-phaserjs";

export abstract class BaseControls {
  input?: PlayerInput;

  getInput() {
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    if (!isInputActive.value) return -1;
    const input = this.input;
    this.resetInput();
    return input;
  }

  resetInput() {
    this.input = undefined;
  }

  setInput(input: PlayerInput) {
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    if (!isInputActive.value) return;
    this.input = input;
  }
}
