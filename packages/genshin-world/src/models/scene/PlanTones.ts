// The tones a part's surface is painted in over a plan, as `fitPlanTones` reads them: the tone most of it shows, and
// Each other tone and its gilding as the loops round it, every shade over the stone's colour
export interface PlanTones {
  stone: readonly number[];
  tones: readonly { loops: readonly (readonly number[])[][]; shade: readonly number[] }[];
}
