// The absolute commands a traced path is parsed into, the relative ones and H and V folded into these
// (services/genshinParity/shared/parseSvgPath.ts)
export enum SvgPathCommand {
  Arc = "A",
  Close = "Z",
  Cubic = "C",
  Line = "L",
  Move = "M",
  Quadratic = "Q",
}
