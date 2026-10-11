// The `points` of a polygon or polyline: pairs written `x,y` and separated by spaces
export const parsePoints = (points: string): [number, number][] =>
  points.split(" ").map((point) => {
    const [x = "", y = ""] = point.split(",");
    return [Number(x), Number(y)];
  });
