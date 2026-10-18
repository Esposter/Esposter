import { createInstanceCulling } from "#src/culling/createInstanceCulling";
import { float } from "three/tsl";
import { describe, expect, test, vi } from "vitest";

describe(createInstanceCulling, () => {
  test("disposing the pass releases the buffer its indirect draw reads", () => {
    expect.hasAssertions();

    const culling = createInstanceCulling({ count: 2, indexCount: 3, isVisible: () => float(1) });
    const onDispose = vi.fn();
    culling.indirect.addEventListener("dispose", onDispose);

    culling.dispose();

    expect(onDispose).toHaveBeenCalledTimes(1);
  });
});
