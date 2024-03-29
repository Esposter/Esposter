export const GameObjectEventMap = {
  pointerout: { eventIndex: 1 },
  pointerup: { eventIndex: 3 },
  pointerdown: { eventIndex: 3 },
  pointermove: { eventIndex: 3 },
  pointerover: { eventIndex: 3 },
  wheel: { eventIndex: 4 },
  dragstart: { drag: true },
  drag: { drag: true },
  dragend: { drag: true },
  dragenter: { drag: true },
  dragover: { drag: true },
  dragleave: { drag: true },
  drop: { drag: true },
} as const;
