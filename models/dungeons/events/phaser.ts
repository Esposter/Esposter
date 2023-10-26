import EventEmitter from "eventemitter3";

interface PhaserEvents {
  resize: () => void;
  updateBackgroundColor: (data: string) => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
