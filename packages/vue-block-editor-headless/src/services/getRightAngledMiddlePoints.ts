import type { Point } from "#src/models/Point";

// The corners between two stub points: a leg between them along the axis each end leaves on, with one corner when the axes differ
export const getRightAngledMiddlePoints = (
  startStub: Point,
  endStub: Point,
  isStartVertical: boolean,
  isEndVertical: boolean,
): Point[] => {
  if (isStartVertical && isEndVertical) {
    const middleY = (startStub.y + endStub.y) / 2;
    return [
      { x: startStub.x, y: middleY },
      { x: endStub.x, y: middleY },
    ];
  }
  if (isStartVertical) return [{ x: startStub.x, y: endStub.y }];
  if (isEndVertical) return [{ x: endStub.x, y: startStub.y }];
  const middleX = (startStub.x + endStub.x) / 2;
  return [
    { x: middleX, y: startStub.y },
    { x: middleX, y: endStub.y },
  ];
};
