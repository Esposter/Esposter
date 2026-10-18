import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjCarouselImage: MjmlComponentSpecification = {
  allowedAttributes: {
    alt: "string",
    "border-radius": "string",
    href: "string",
    rel: "string",
    src: "string",
    target: "string",
    "tb-border": "string",
    "tb-border-radius": "string",
    "thumbnails-src": "string",
    title: "string",
  },
  children: [],
  defaultAttributes: { alt: "", target: "_blank" },
  hasAlternativeText: true,
  type: "mj-carousel-image",
};
