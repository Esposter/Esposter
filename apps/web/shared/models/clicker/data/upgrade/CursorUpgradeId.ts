export const CursorUpgradeId = {
  Ambidextrous: "Ambidextrous",
  BillionFingers: "Billion Fingers",
  CarpalTunnelPreventionCream: "Carpal Tunnel Prevention Cream",
  DecillionFingers: "Decillion Fingers",
  MillionFingers: "Million Fingers",
  NonillionFingers: "Nonillion Fingers",
  OctillionFingers: "Octillion Fingers",
  QuadrillionFingers: "Quadrillion Fingers",
  QuintillionFingers: "Quintillion Fingers",
  ReinforcedIndexFinger: "Reinforced Index Finger",
  SeptillionFingers: "Septillion Fingers",
  SextillionFingers: "Sextillion Fingers",
  ThousandFingers: "Thousand Fingers",
  TrillionFingers: "Trillion Fingers",
} as const;
export type CursorUpgradeId = (typeof CursorUpgradeId)[keyof typeof CursorUpgradeId];
