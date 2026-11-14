import { InvalidOperationError, Operation } from "@esposter/shared";

// The request path of an object, each segment of its key percent-encoded so a slash stays a separator. An empty key is the
// bucket itself. A "." or ".." segment is refused: a URL resolves it away, and the request would name another object
export const getR2ObjectPath = (bucket: string, key: string): string => {
  const segments = key.split("/");
  if (segments.some((segment) => segment === "." || segment === ".."))
    throw new InvalidOperationError(Operation.Read, key, "has a . or .. segment, which a URL resolves away");
  return `/${bucket}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
};
