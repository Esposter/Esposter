import type { BuilderOptions } from "xml2js";
import type { XMLBuilder } from "xmlbuilder2/lib/interfaces";

import { DefaultBuilderOptions } from "@/DefaultBuilderOptions";
import { create } from "xmlbuilder2";

export class Builder {
  private options: typeof DefaultBuilderOptions = structuredClone(DefaultBuilderOptions);

  constructor(init?: Partial<BuilderOptions>) {
    Object.assign(this.options, init);
  }

  buildObject(rootObj: Record<string, unknown>): string {
    // If there is a sane-looking first element to use as the root,
    // And the user hasn't specified a non-default rootName,
    let rootName = this.options.rootName;
    let rootObject = rootObj;
    if (Object.keys(rootObject).length === 1 && this.options.rootName === DefaultBuilderOptions.rootName) {
      // We'll take the first element as the root element
      rootName = Object.keys(rootObject)[0];
      rootObject = rootObject[rootName] as Record<string, unknown>;
    }

    const rootElement = create(this.options.xmldec).ele(rootName);
    return this.render(rootElement, rootObject).end(this.options.renderOpts);
  }

  private render(
    element: XMLBuilder,
    object: Record<string, Record<string, unknown>>[] | Record<string, unknown> | string,
  ): XMLBuilder {
    if (typeof object !== "object")
      if (this.options.cdata) return element.dat(object);
      else element.txt(object);
    else if (Array.isArray(object))
      // https://github.com/Leonidas-from-XIV/node-xml2js/issues/119
      for (const child of object.values())
        for (const [key, entry] of Object.entries(child)) return this.render(element.ele(key), entry).up();
    else
      // Case #1 Attribute
      for (const [key, child] of Object.entries(object))
        if (key === this.options.attrkey) {
          if (typeof child === "object")
            // Inserts tag attributes
            for (const [attr, value] of Object.entries(child as Record<string, string>))
              element = element.att(attr, value);
          // Case #2 Char data (CDATA, etc.)
        } else if (key === this.options.charkey)
          if (this.options.cdata) element = element.dat(child as string);
          else element = element.txt(child as string);
        // Case #3 Array data
        else if (Array.isArray(child))
          for (const entry of child.values())
            if (typeof entry === "string")
              if (this.options.cdata) element = element.ele(key).dat(entry).up();
              else element = element.ele(key, entry).up();
            else element = this.render(element.ele(key), entry).up();
        // Case #4 Objects
        else if (typeof child === "object")
          element = this.render(element.ele(key), child as Record<string, string>).up();
        // Case #5 String and remaining types
        else if (typeof child === "string" && this.options.cdata) element = element.ele(key).dat(child).up();
        else element = element.ele(key, child?.toString() ?? "").up();

    return element;
  }
}
