/* oxlint-disable no-param-reassign -- faithful xml2js port mutates the element accumulator in place */
import type { BuilderOptions } from "xml2js";
import type { XMLBuilder } from "xmlbuilder2/lib/interfaces";

import { DefaultBuilderOptions } from "#src/DefaultBuilderOptions";
import { takeOne } from "@esposter/shared";
import { create } from "xmlbuilder2";

// `typeof null === "object"`, so every nullish value that reaches `Object.entries` throws. The original iterates with
// `for key of obj`, which runs zero times for one, so a nullish value contributes no entries here either.
const getEntries = <T>(value: unknown): [string, T][] =>
  value === null || value === undefined ? [] : Object.entries(value as Record<string, T>);

export class Builder {
  readonly #options: typeof DefaultBuilderOptions = structuredClone(DefaultBuilderOptions);

  constructor(init?: Partial<BuilderOptions>) {
    Object.assign(this.#options, init);
  }

  buildObject(rootObj: Record<string, unknown>): string {
    // Use a lone first element as the root, unless the user specified a non-default rootName.
    let rootName = this.#options.rootName;
    let rootObject = rootObj;
    if (Object.keys(rootObject).length === 1 && this.#options.rootName === DefaultBuilderOptions.rootName) {
      rootName = takeOne(Object.keys(rootObject));
      rootObject = rootObject[rootName] as Record<string, unknown>;
    }

    const rootElement = create(this.#options.xmldec).ele(rootName);
    return this.#render(rootElement, rootObject).end(this.#options.renderOpts);
  }

  #render(element: XMLBuilder, object: unknown): XMLBuilder {
    // `typeof null === "object"`, so a nullish leaf would otherwise reach `Object.entries` and throw. Xml has no
    // Representation for it, so it renders as the empty element its caller already created.
    if (object === null || object === undefined) return element;
    else if (typeof object !== "object") return this.#renderText(element, object);
    else if (Array.isArray(object))
      // https://github.com/Leonidas-from-XIV/node-xml2js/issues/119
      for (const child of object.values())
        for (const [key, entry] of getEntries<unknown>(child)) element = this.#render(element.ele(key), entry).up();
    else
      for (const [key, child] of Object.entries(object))
        // Tag attributes
        if (key === this.#options.attrkey) {
          if (typeof child === "object")
            for (const [attr, value] of getEntries<string>(child)) element = element.att(attr, value);
          // Char data (CDATA, etc.)
        } else if (key === this.#options.charkey) element = this.#renderText(element, child);
        // Array data
        else if (Array.isArray(child))
          for (const entry of child.values()) element = this.#render(element.ele(key), entry).up();
        // Objects, scalars and nullish leaves
        else element = this.#render(element.ele(key), child).up();

    return element;
  }
  // A string second argument to `ele` is xmlbuilder2's namespace overload, not the element's text, so scalars are
  // Written onto the element the caller already created.
  #renderText(element: XMLBuilder, text: unknown): XMLBuilder {
    const content = String(text);
    return this.#options.cdata ? element.dat(content) : element.txt(content);
  }
}
