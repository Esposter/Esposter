if (!window.SharedArrayBuffer) {
  console.log("Polyfilling SharedArrayBuffer.");
  // Use a dummy class to polyfill SharedArrayBuffer
  // This tricks libraries like whatwg-url into thinking it exists
  window.SharedArrayBuffer = class SharedArrayBuffer {
    static get [Symbol.species]() {
      return SharedArrayBuffer;
    }

    get byteLength() {
      return 0;
    }

    get growable() {
      return false;
    }

    get [Symbol.toStringTag]() {
      return "SharedArrayBuffer";
    }

    constructor() {
      throw new Error("SharedArrayBuffer is not supported and has been stubbed.");
    }

    grow() {
      throw new Error("Method not implemented.");
    }

    slice() {
      return new Error("Method not implemented.");
    }
  };
}
