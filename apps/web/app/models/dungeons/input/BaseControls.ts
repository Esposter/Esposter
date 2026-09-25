import type { Controls } from "@/models/dungeons/input/Controls";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { Direction } from "grid-engine";
import { useInputStore } from "vue-phaserjs";

export abstract class BaseControls implements Controls {
  input?: PlayerInput;

  // An input set by the game wins over the device, and neither is read while input is paused. Decided here once,
  // So a device only answers what it is holding and can never report a press the game was not listening for
  getInput(isJustDown?: true) {
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    if (!isInputActive.value) return Direction.NONE;

    const input = this.input;
    this.resetInput();
    return input ?? this.getDeviceInput(isJustDown);
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

  protected abstract getDeviceInput(isJustDown?: true): PlayerInput;
}
