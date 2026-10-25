// The container's scale on screen, so an offset measured on screen is written in the container's own pixels
export const getDragScale = (container: HTMLElement) => {
  const containerHeight = container.offsetHeight;
  return containerHeight > 0 ? container.getBoundingClientRect().height / containerHeight : 1;
};
