// Puts each row where it sits with no transition, so a row still sliding from the last drop is measured where it
// Is going
export const clearRowMotion = (items: HTMLElement[]) => {
  for (const item of items) {
    item.style.transition = "none";
    item.style.translate = "";
  }
};
