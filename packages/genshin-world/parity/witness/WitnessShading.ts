// How the witness draws its exports: with their own textures, or each material as the one colour its diffuse texture
// Averages, so the textures' share of what the scene loses is priced apart from the geometry's
export enum WitnessShading {
  Exported = "Exported",
  Flat = "Flat",
}
