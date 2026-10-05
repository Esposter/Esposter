export interface Texture {
  data: Buffer;
  info: { channels: number; height: number; width: number };
}
