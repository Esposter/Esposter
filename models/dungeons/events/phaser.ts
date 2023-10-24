import EventEmitter from "eventemitter3";

interface PhaserEvents {
  onUpdateBackgroundColor: (data: string) => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
