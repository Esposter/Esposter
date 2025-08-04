import { z } from "zod";

export enum NodeType {
  Base = "Base",
}

export const nodeTypeSchema = z.enum(NodeType);
