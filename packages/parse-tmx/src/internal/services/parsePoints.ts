// The `points` of a polygon or polyline: pairs written `x,y` and separated by spaces.
// The result is empty when there are none to read.
export const parsePoints = (points: string): [number, number][] =>
  points
    ? points.split(" ").map((point) => {
        const [x = "", y = ""] = point.split(",");
        return [Number(x), Number(y)];
      })
    : [];
