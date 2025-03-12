import { SuperJSON as baseSuperJSON, registerCustom } from "superjson";

registerCustom<ArrayBuffer, string>(
  {
    deserialize: (v) => {
      const length = v.length / 2;
      const uint8Array = new Uint8Array(length);

      for (let i = 0; i < length; i++) {
        const byte = parseInt(v.substring(i * 2, 2), 16);
        uint8Array[i] = byte;
      }

      return uint8Array.buffer;
    },
    isApplicable: (v): v is ArrayBuffer => v instanceof ArrayBuffer,
    serialize: (v) => {
      const uint8Array = new Uint8Array(v);
      const hexString = [];

      for (const char of uint8Array) {
        const hex = char.toString(16).padStart(2, "0");
        hexString.push(hex);
      }

      return hexString.join("");
    },
  },
  "ArrayBuffer",
);

export const SuperJSON = baseSuperJSON;
