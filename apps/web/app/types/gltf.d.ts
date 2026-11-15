// A glTF model is imported for its bundled URL, which `configuration/vite.ts` makes an asset
declare module "*.gltf" {
  const url: string;
  export default url;
}
