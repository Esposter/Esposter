import { useInputStore } from "@/lib/phaser/store/input";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

export abstract class BaseControls {
  input: PlayerInput | null = null;

  getInput() {
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    if (!isInputActive.value) return -1;
    const input = this.input;
    this.resetInput();
    return input;
  }

  setInput(input: PlayerInput) {
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    if (!isInputActive.value) return;
    this.input = input;
  }

  resetInput() {
    this.input = null;
  }
}
