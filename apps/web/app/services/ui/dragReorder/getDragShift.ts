import { takeOne } from "@esposter/shared";

// How far a row the held one passes moves aside: the held row's height and the gap after it
export const getDragShift = (rects: DOMRect[], index: number) => {
  const rect = takeOne(rects, index);
  const nextRect = rects[index + 1];
  const previousRect = rects[index - 1];
  return nextRect ? nextRect.top - rect.top : previousRect ? rect.bottom - previousRect.bottom : rect.height;
};
