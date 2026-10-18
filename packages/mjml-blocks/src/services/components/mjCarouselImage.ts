import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjCarouselImage: MjmlComponentSpecification = {
  allowedAttributes: {
    alt: "string",
    href: "string",
    rel: "string",
    target: "string",
    title: "string",
    src: "string",
    "thumbnails-src": "string",
    "border-radius": "string",
    "tb-border": "string",
    "tb-border-radius": "string",
  },
  children: [],
  contentKind: undefined,
  defaultAttributes: { alt: "", target: "_blank" },
  hasAlternativeText: true,
  type: "mj-carousel-image",
};
