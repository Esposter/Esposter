import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";

// Restores each recorded property to the value it held before its first write, or every recorded property when none are named.
// A property that held no value is removed, and its record goes with it, so its next write records afresh
export const restorePanzoomStyles = ({ styles }: PanzoomContext, properties?: readonly string[]): void => {
  for (const [element, values] of styles) {
    const restoredProperties = properties ?? [...values.keys()];
    for (const property of restoredProperties.filter((name) => values.has(name))) {
      const previousValue = values.get(property) ?? "";
      if (previousValue) element.style.setProperty(property, previousValue);
      else element.style.removeProperty(property);

      values.delete(property);
    }
  }
};
