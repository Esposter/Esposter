import type { SoundBankObject } from "#src/models/genshinAssets/music/SoundBankObject";
import type { WwiseNode } from "#src/models/genshinAssets/music/WwiseNode";

import { WwiseCurveParameter } from "#src/models/genshinAssets/music/WwiseCurveParameter";
import { WwiseProperty } from "#src/models/genshinAssets/music/WwiseProperty";
import { evaluateWwiseCurve } from "#src/services/genshinAssets/music/evaluateWwiseCurve";
import { parseWwiseNode } from "#src/services/genshinAssets/music/parseWwiseNode";
import { InvalidOperationError, Operation } from "@esposter/shared";

const VOLUME_PROPERTIES: readonly WwiseProperty[] = Object.values(WwiseProperty).filter(
  (value) => typeof value === "number",
);
const VOLUME_CURVE_PARAMETERS: ReadonlySet<number> = new Set(
  Object.values(WwiseCurveParameter).filter((value) => typeof value === "number"),
);
// How loud the game's mix plays a node, in decibels over its source: its own volume and every parent's up the
// Hierarchy, then the bus the nearest of them sends to and every bus above it to the output, each node's volumes summed
// With its game parameters' curves read at the parameters' defaults, as the mix stands before the game moves any
export const computeWwiseVolume = (
  id: number,
  objectMap: ReadonlyMap<number, SoundBankObject>,
  parameterDefaults: ReadonlyMap<number, number>,
): number => {
  const getNode = (nodeId: number): WwiseNode => {
    const object = objectMap.get(nodeId);
    if (!object) throw new InvalidOperationError(Operation.Read, String(nodeId), "in no sound bank");
    return parseWwiseNode(object);
  };
  const getVolume = ({ curves, properties }: WwiseNode): number => {
    let volume = 0;
    for (const property of VOLUME_PROPERTIES) volume += properties.get(property) ?? 0;
    for (const curve of curves) {
      if (!VOLUME_CURVE_PARAMETERS.has(curve.parameter)) continue;
      const value = parameterDefaults.get(curve.gameParameterId);
      if (!curve.isGameParameter || value === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          String(curve.gameParameterId),
          "is a volume curve's unread input",
        );
      volume += evaluateWwiseCurve(curve, value);
    }
    return volume;
  };
  let volume = 0;
  let busId = 0;
  for (let nodeId = id; nodeId !== 0;) {
    const node = getNode(nodeId);
    volume += getVolume(node);
    busId ||= node.busId;
    nodeId = node.parentId;
  }
  if (busId === 0) throw new InvalidOperationError(Operation.Read, String(id), "sends to no bus");
  for (let nodeId = busId; nodeId !== 0;) {
    const bus = getNode(nodeId);
    volume += getVolume(bus);
    nodeId = bus.parentId;
  }
  return volume;
};
