import { extname } from "node:path";

export const getBlobName = (roomId: string, id: string, filename: string) =>
  `${roomId}/${id}${extname(filename).toLowerCase()}`;
