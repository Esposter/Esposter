import { GameObjectEvent } from "#src/models/emit/GameObjectEvent";

export const GameObjectEventMap = {
  [GameObjectEvent.Clickoutside]: {},
  [GameObjectEvent.Drag]: { drag: true },
  [GameObjectEvent.Dragend]: { drag: true },
  [GameObjectEvent.Dragenter]: { drag: true },
  [GameObjectEvent.Dragleave]: { drag: true },
  [GameObjectEvent.Dragover]: { drag: true },
  [GameObjectEvent.Dragstart]: { drag: true },
  [GameObjectEvent.Drop]: { drag: true },
  [GameObjectEvent.Pointerdown]: { eventIndex: 3 },
  [GameObjectEvent.Pointermove]: { eventIndex: 3 },
  [GameObjectEvent.Pointerout]: { eventIndex: 1 },
  [GameObjectEvent.Pointerover]: { eventIndex: 3 },
  [GameObjectEvent.Pointerup]: { eventIndex: 3 },
  [GameObjectEvent.Wheel]: { eventIndex: 4 },
} as const;
