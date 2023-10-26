import EventEmitter from "eventemitter3";

interface PhaserEvents {
  resize: () => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
