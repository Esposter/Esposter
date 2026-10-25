import type { InferenceSession } from "onnxruntime-common";

import { unwrapWindowReadings } from "#src/services/unwrapWindowReadings";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// One output read as its rows, then disposed. The values are read before the output is disposed, since disposing a GPU
// Tensor releases its data and a CPU tensor's values are only held by the array read from it
export const readOutput = async (
  outputs: InferenceSession.ReturnType,
  name: string,
  binCount: number,
): Promise<number[][]> => {
  const output = takeOne(outputs, name);
  const data = await output.getData();
  output.dispose();
  if (!(data instanceof Float32Array))
    throw new InvalidOperationError(
      Operation.Read,
      readOutput.name,
      `${name} as ${output.type}, the model writes float32`,
    );
  return unwrapWindowReadings(data, binCount);
};
