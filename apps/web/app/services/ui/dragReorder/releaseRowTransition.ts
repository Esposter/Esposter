import type { DragReorderContext } from "@/models/ui/dragReorder/DragReorderContext";

// The slide's transition comes off a row once it has arrived, at once under reduced motion, which runs none, and never
// Off a row a newer drag already holds
export const releaseRowTransition = async (context: DragReorderContext, item: HTMLElement) => {
  await Promise.allSettled(item.getAnimations().map(({ finished }) => finished));
  if (!context.press?.drag || !context.press.items.includes(item)) item.style.transition = "";
};
