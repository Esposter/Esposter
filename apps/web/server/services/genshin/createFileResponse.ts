import { contentType } from "@esposter/shared";
import { extname } from "node:path";

// A file's body served as the type its name's extension gives, as bytes where it gives none
export const createFileResponse = (body: BodyInit, name: string): Response =>
  new Response(body, { headers: { "Content-Type": contentType(extname(name)) || "application/octet-stream" } });
