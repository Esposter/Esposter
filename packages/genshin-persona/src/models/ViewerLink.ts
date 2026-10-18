// One connection to the viewer's socket: the messages the plugin sends to a model and the taps it takes back
export interface ViewerLink {
  bubble: (modelId: number, text: string, durationMs: number, frameColor: number, textColor: number) => void;
  close: () => void;
  expressionClear: (modelId: number) => void;
  isOpen: () => boolean;
  motion: (modelId: number, motion: string) => void;
  onTap: (listener: () => void) => void;
  playSound: (modelId: number, path: string) => void;
  soundStop: (modelId: number) => void;
}
