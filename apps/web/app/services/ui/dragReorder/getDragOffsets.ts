import { takeOne } from "@esposter/shared";

// The offset that sits the held row in each slot, from where the rows sat when the drag started
export const getDragOffsets = (rects: DOMRect[], index: number) => {
  const rect = takeOne(rects, index);
  return rects.map(({ bottom, top }, rectIndex) => {
    if (rectIndex < index) return top - rect.top;
    else if (rectIndex > index) return bottom - rect.bottom;
    else return 0;
  });
};
