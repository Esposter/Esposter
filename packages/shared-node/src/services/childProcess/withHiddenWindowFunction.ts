import { withHiddenWindow } from "#src/services/childProcess/withHiddenWindow";

// Returns a wrapper typed as the node function it forwards to, so every overload that function has still holds. The first
// Argument and the rest are forwarded with the options changed, which no overload takes as a spread, so the forwarder is
// Asserted here once, and each wrapper that uses it names no cast of its own
export const withHiddenWindowFunction = <TFunction extends (...nodeParameters: never[]) => unknown>(
  nodeFunction: TFunction,
): TFunction => {
  const forwarder = (...nodeParameters: never[]): unknown => {
    const [file, ...parameters] = nodeParameters;
    return Reflect.apply(nodeFunction, undefined, [file, ...withHiddenWindow(parameters)]);
  };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- node's overloads cannot take the forwarded list as a spread, so the forwarder is typed as the node function it forwards to
  return forwarder as TFunction;
};
