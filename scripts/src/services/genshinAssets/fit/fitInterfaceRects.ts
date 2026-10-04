import type { FittedInterfaceRect } from "#src/models/genshinAssets/fit/FittedInterfaceRect";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

const roundPair = ([x, y]: [number, number]): [number, number] => [roundFitted(x), roundFitted(y)];
// A screen's interface tree as the rects its markup nests, keyed by each piece's path under the root, which is the
// Canvas itself and so left out. A layout group places its children at run time, so their rects read zero and are left
// Out with everything under them; the group's own rect stays, and its spacing is measured
export const fitInterfaceRects = (root: InterfaceNode): Record<string, FittedInterfaceRect> => {
  const toEntries = ({
    anchoredPosition,
    anchorMax,
    anchorMin,
    children,
    components,
    path,
    pivot,
    scale,
    sizeDelta,
  }: InterfaceNode): [string, FittedInterfaceRect][] => [
    [
      path.slice(root.path.length + 1),
      {
        anchorMax: roundPair(anchorMax),
        anchorMin: roundPair(anchorMin),
        pivot: roundPair(pivot),
        position: roundPair(anchoredPosition),
        ...(scale.every((value) => value === 1) ? {} : { scale: roundPair(scale) }),
        size: roundPair(sizeDelta),
      },
    ],
    ...(components.some((component) => component.endsWith("LayoutGroup"))
      ? []
      : children.flatMap((child) => toEntries(child))),
  ];
  return Object.fromEntries(root.children.flatMap((child) => toEntries(child)));
};
