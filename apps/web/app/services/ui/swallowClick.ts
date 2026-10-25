export const swallowClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};
