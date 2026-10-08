// One region's share of a fit: how many of its points matched, the residual of those, and its Oculi counted against the
// Wiki's; a region none of whose points matched has no residual
export interface InteractiveMapRegionFit {
  matched: number;
  oculusCount: number;
  oculusWikiCount: number;
  region: string;
  residual?: number;
}
