import type { Vector3Tuple } from "three";

import { PmxTextEncoding } from "#src/models/character/PmxTextEncoding";

// A cursor over a PMX file's bytes, little-endian as the format stores them, sized by the globals its header holds: the
// Text's encoding, the extra vectors each vertex carries, and each kind of index's width in bytes. A position, a
// Direction or a rotation is mirrored as it is read, z turned round, from MMD's left-handed space into three's
// Right-handed one
export class PmxReader {
  readonly additionalVectorCount: number;
  readonly boneIndexSize: number;
  readonly materialIndexSize: number;
  readonly morphIndexSize: number;
  readonly rigidBodyIndexSize: number;
  readonly textureIndexSize: number;
  readonly vertexIndexSize: number;
  // The globals follow the signature, "PMX ", and the version, four bytes each, neither of which is read
  #offset = 8;
  readonly #textDecoder: TextDecoder;
  readonly #view: DataView;

  constructor(buffer: ArrayBuffer) {
    this.#view = new DataView(buffer);
    const globalCount = this.readUint8();
    const globalsEnd = this.#offset + globalCount;
    const textEncoding: PmxTextEncoding = this.readUint8();
    this.#textDecoder = new TextDecoder(textEncoding === PmxTextEncoding.Utf8 ? "utf8" : "utf-16le");
    this.additionalVectorCount = this.readUint8();
    this.vertexIndexSize = this.readUint8();
    this.textureIndexSize = this.readUint8();
    this.materialIndexSize = this.readUint8();
    this.boneIndexSize = this.readUint8();
    this.morphIndexSize = this.readUint8();
    this.rigidBodyIndexSize = this.readUint8();
    // A later version may hold more globals than these
    this.#offset = globalsEnd;
  }

  readBoneIndex(): number {
    return this.#readIndex(this.boneIndexSize);
  }

  readFloat32(): number {
    const value = this.#view.getFloat32(this.#offset, true);
    this.#offset += 4;
    return value;
  }

  readInt32(): number {
    const value = this.#view.getInt32(this.#offset, true);
    this.#offset += 4;
    return value;
  }

  readMaterialIndex(): number {
    return this.#readIndex(this.materialIndexSize);
  }

  readMirroredRotation(): Vector3Tuple {
    const x = this.readFloat32();
    const y = this.readFloat32();
    const z = this.readFloat32();
    return [-x, -y, z];
  }

  readMirroredVector3(): Vector3Tuple {
    const x = this.readFloat32();
    const y = this.readFloat32();
    const z = this.readFloat32();
    return [x, y, -z];
  }

  readMirroredVector3Into(target: Float32Array, offset: number): void {
    target[offset] = this.readFloat32();
    target[offset + 1] = this.readFloat32();
    target[offset + 2] = -this.readFloat32();
  }

  readMorphIndex(): number {
    return this.#readIndex(this.morphIndexSize);
  }

  readRigidBodyIndex(): number {
    return this.#readIndex(this.rigidBodyIndexSize);
  }

  readText(): string {
    const byteLength = this.readInt32();
    const text = this.#textDecoder.decode(new Uint8Array(this.#view.buffer, this.#offset, byteLength));
    this.#offset += byteLength;
    return text;
  }

  readTextureIndex(): number {
    return this.#readIndex(this.textureIndexSize);
  }

  readUint8(): number {
    const value = this.#view.getUint8(this.#offset);
    this.#offset += 1;
    return value;
  }

  readUint16(): number {
    const value = this.#view.getUint16(this.#offset, true);
    this.#offset += 2;
    return value;
  }

  readVector3(): Vector3Tuple {
    const x = this.readFloat32();
    const y = this.readFloat32();
    const z = this.readFloat32();
    return [x, y, z];
  }

  // A vertex's index is unsigned at one and two bytes, where every other index is signed so -1 can mean none
  readVertexIndex(): number {
    if (this.vertexIndexSize === 1) return this.readUint8();
    else if (this.vertexIndexSize === 2) return this.readUint16();
    else return this.readInt32();
  }

  skip(byteCount: number): void {
    this.#offset += byteCount;
  }

  #readIndex(size: number): number {
    const offset = this.#offset;
    this.#offset += size;
    if (size === 1) return this.#view.getInt8(offset);
    else if (size === 2) return this.#view.getInt16(offset, true);
    else return this.#view.getInt32(offset, true);
  }
}
