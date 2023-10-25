import EventEmitter from "eventemitter3";

interface PhaserEvents {
  onResize: () => void;
  onUpdateBackgroundColor: (data: string) => void;
}

export const phaserEventEmitter = new EventEmitter<PhaserEvents>();
