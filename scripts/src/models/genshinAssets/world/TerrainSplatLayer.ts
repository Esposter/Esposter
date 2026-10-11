// One layer of a terrain tile's splat database: the path id of its diffuse texture, the kind it names and the metres
// One repeat of its textures spans
export interface TerrainSplatLayer {
  diffusePathId: string;
  kind: number;
  tileSize: number;
}
