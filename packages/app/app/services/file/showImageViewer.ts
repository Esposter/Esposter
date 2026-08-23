import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
// Viewerjs reads its gallery from the img children of an element that is already in the document, so opening
// One over urls rather than over rendered images means building that element and taking it back out on close
export const showImageViewer = (images: { alt: string; src: string }[], initialViewIndex: number) => {
  const container = document.createElement("div");
  container.style.display = "none";

  for (const { alt, src } of images) {
    const image = document.createElement("img");
    image.alt = alt;
    image.src = src;
    container.append(image);
  }

  document.body.append(container);
  const viewer = new Viewer(container, {
    hidden: () => {
      viewer.destroy();
      container.remove();
    },
    initialViewIndex,
  });
  viewer.show();
};
