import { takeOne } from "@esposter/shared";

// How far each row slides from where it was let go to where it now sits, in the container's own pixels. A row that has
// Left the page has nowhere to slide from
export const getDragSlides = (items: HTMLElement[], fromTops: number[], scale: number) =>
  items.map((item, index) =>
    item.isConnected ? (takeOne(fromTops, index) - item.getBoundingClientRect().top) / scale : 0,
  );
