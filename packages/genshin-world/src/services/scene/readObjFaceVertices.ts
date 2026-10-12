// Each group of an OBJ file by its name, with the vertex each of its faces names first, counted from zero, in the order
// The file writes them: the order the OBJ loader keeps their triangles in, so a triangle's place in its submesh is its
// Face's place in its group
export const readObjFaceVertices = (text: string): Map<string, number[]> => {
  const groupFaceVerticesMap = new Map<string, number[]>();
  let faceVertices: number[] = [];
  for (const line of text.split("\n"))
    if (line.startsWith("g ")) {
      faceVertices = [];
      groupFaceVerticesMap.set(line.slice(2).trim(), faceVertices);
    } else if (line.startsWith("f ")) {
      const [vertex] = line.slice(2).split(/[\s/]/u, 1);
      faceVertices.push(Number(vertex) - 1);
    }
  return groupFaceVerticesMap;
};
