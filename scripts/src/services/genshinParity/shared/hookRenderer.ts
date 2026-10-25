// Hands the renderer and the scene over as soon as the devtools messenger publishes its context, before the first frame
// It draws
export const hookRenderer = (): void => {
  window.__hooked = false;
  window.__TRES__DEVTOOLS__?.subscribers.add((message) => {
    if (message.type !== "context" || window.__hooked) return;
    const holder = message.data.renderer;
    const renderer = holder.instance ?? holder.value?.instance;
    if (!renderer) return;
    window.__hooked = true;
    window.__renderer = renderer;
    window.__scene = message.data.scene?.value;
  });
};
