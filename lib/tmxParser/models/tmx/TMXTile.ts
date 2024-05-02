export interface TMXTile {
  id: number;
  type: string;
  animation?: Record<string, unknown>;
  objects?: Record<string, unknown>[];
  probability?: number;
}
