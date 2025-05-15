import type { QualifiedTag, SAXParser, Tag } from "sax";
import type { convertableToString, ParserOptions } from "xml2js";

import { DefaultParserOptions } from "@/DefaultParserOptions";
import { normalize } from "@/processors";
import { stripBOM } from "@/stripBOM";
import { parser } from "sax";

export class Parser {
  private options: typeof DefaultParserOptions = structuredClone(DefaultParserOptions);
  private resultObject: Record<string, unknown> = {};
  private saxParser: SAXParser;
  private xmlnsKey = "";

  constructor(init?: Partial<ParserOptions>) {
    Object.assign(this.options, init);
    // Define the key used for namespaces
    if (this.options.xmlns) this.xmlnsKey = `${this.options.attrkey}ns`;
    if (this.options.normalizeTags) {
      this.options.tagNameProcessors ??= [];
      this.options.tagNameProcessors.unshift(normalize);
    }

    this.saxParser = parser(this.options.strict, { normalize: false, trim: false, xmlns: this.options.xmlns });
    this.saxParser.onerror = () => {
      this.saxParser.resume();
    };

    const stack: Record<string, unknown>[] = [];
    this.saxParser.onopentag = (node) => {
      const object: Record<string, unknown> = {};
      object[this.options.charkey] = "";
      if (!this.options.ignoreAttrs)
        for (const key in node.attributes)
          if (Object.prototype.hasOwnProperty.call(node.attributes, key)) {
            if (!(this.options.attrkey in object) && !this.options.mergeAttrs) object[this.options.attrkey] = {};

            const newValue = this.options.attrValueProcessors
              ? processItem(this.options.attrValueProcessors, (node as Tag).attributes[key], key)
              : node.attributes[key];
            const processedKey = this.options.attrNameProcessors
              ? processItem(this.options.attrNameProcessors, key, "")
              : key;
            if (this.options.mergeAttrs) this.assignOrPush(object, processedKey, newValue);
            else defineProperty(object[this.options.attrkey] as Record<string, unknown>, processedKey, newValue);
          }

      // We will hardcode a place to store the node name
      object["#name"] = this.options.tagNameProcessors
        ? processItem(this.options.tagNameProcessors, node.name, "")
        : node.name;
      if (this.options.xmlns)
        object[this.xmlnsKey] = { local: (node as QualifiedTag).local, uri: (node as QualifiedTag).uri };

      stack.push(object);
    };
    this.saxParser.onclosetag = () => {
      let object = stack.pop();
      if (!object) return;

      const nodeName = object["#name"] as string;
      if (!(this.options.explicitChildren && this.options.preserveChildrenOrder)) delete object["#name"];

      let cdata = false;
      if (object.cdata === true) {
        cdata = object.cdata;
        delete object.cdata;
      }

      const nextObject = stack.at(-1);
      let emptyStr = "";
      // Remove the '#' key altogether if it's blank
      const char = object[this.options.charkey] as string;
      if (/^\s*$/.exec(char) && !cdata) {
        emptyStr = char;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete object[this.options.charkey];
      } else {
        if (this.options.trim) object[this.options.charkey] = char.trim();
        if (this.options.normalize) object[this.options.charkey] = char.replace(/\s{2,}/g, " ").trim();

        object[this.options.charkey] = this.options.valueProcessors
          ? processItem(this.options.valueProcessors, char, nodeName)
          : char;
        // Do away with '#' key altogether, if there's no subkeys
        if (Object.keys(object).length === 1 && this.options.charkey in object)
          object = object[this.options.charkey] as Record<string, unknown>;
      }

      if (isEmpty(object))
        if (typeof this.options.emptyTag === "function") object = this.options.emptyTag();
        else
          object = (this.options.emptyTag !== "" ? this.options.emptyTag : emptyStr) as unknown as Record<
            string,
            unknown
          >;

      if (this.options.validator) {
        const xpath =
          "/" +
          stack
            .map((node) => node["#name"])
            .concat(nodeName)
            .join("/");
        object = this.options.validator(xpath, nextObject?.[nodeName], object);
      }

      // Put children into <childkey> property and unfold chars if necessary
      if (this.options.explicitChildren && !this.options.mergeAttrs && typeof object === "object")
        if (!this.options.preserveChildrenOrder) {
          const node: Record<string, unknown> = {};
          // separate attributes
          if (this.options.attrkey in object) {
            node[this.options.attrkey] = object[this.options.attrkey];
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete object[this.options.attrkey];
          }
          // Separate char data
          if (!this.options.charsAsChildren && this.options.charkey in object) {
            node[this.options.charkey] = object[this.options.charkey];
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete object[this.options.charkey];
          }

          if (Object.getOwnPropertyNames(object).length > 0) node[this.options.childkey] = object;

          object = node;
        } else if (nextObject) {
          // Append current node onto parent's <childKey> array
          nextObject[this.options.childkey] ??= [];
          // Push a clone so that the node in the children array can receive the #name property while the original object can do without it
          (nextObject[this.options.childkey] as Record<string, unknown>[]).push(structuredClone(object));
          delete object["#name"];
          // Re-check whether we can collapse the node now to just the this.options.charkey value
          if (Object.keys(object).length === 1 && this.options.charkey in object)
            object = object[this.options.charkey] as Record<string, unknown>;
        }
      // Check whether we closed all the open tags
      if (stack.length > 0) this.assignOrPush(nextObject ?? {}, nodeName, object);
      else {
        // If explicitRoot was specified, wrap stuff in the root tag name
        if (this.options.explicitRoot) {
          // Avoid circular references
          const oldObject = object;
          object = {};
          defineProperty(object, nodeName, oldObject);
        }

        this.resultObject = object ?? {};
      }
    };

    const ontext = (text: string): Record<string, unknown> | undefined => {
      const s = stack.at(-1);
      if (!s) return undefined;

      s[this.options.charkey] += text;

      if (
        this.options.explicitChildren &&
        this.options.preserveChildrenOrder &&
        this.options.charsAsChildren &&
        (this.options.includeWhiteChars || text.replace(/\\n/g, "").trim() !== "")
      ) {
        s[this.options.childkey] ??= [];
        const charChild: Record<string, string> = {
          "#name": "__text__",
        };
        charChild[this.options.charkey] = text;
        if (this.options.normalize)
          charChild[this.options.charkey] = charChild[this.options.charkey].replace(/\s{2,}/g, " ").trim();

        (s[this.options.childkey] as Record<string, string>[]).push(charChild);
      }

      return s;
    };

    this.saxParser.ontext = ontext;
    this.saxParser.oncdata = (text: string) => {
      const s = ontext(text);
      if (s) s.cdata = true;
    };
  }

  parseStringPromise<T>(convertableToString: convertableToString): Promise<T> {
    return new Promise<T>((resolve) => this.parseString(convertableToString, resolve));
  }

  private assignOrPush(object: Record<string, unknown>, key: string, newValue: unknown): void {
    if (!(key in object))
      if (!this.options.explicitArray) defineProperty(object, key, newValue);
      else defineProperty(object, key, [newValue]);
    else {
      const objectValue = object[key];
      if (!Array.isArray(objectValue)) defineProperty(object, key, [objectValue]);
      else objectValue.push(newValue);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  private parseString<T>(convertableToString: convertableToString, callback: (result: T) => void): SAXParser {
    const string = stripBOM(convertableToString.toString());
    this.saxParser.onend = () => {
      callback(this.resultObject as T);
      this.resultObject = {};
    };
    return this.saxParser.write(string).close();
  }
}

export const parseStringPromise = <T>(str: convertableToString, options?: ParserOptions): Promise<T> => {
  const parser = new Parser(options);
  return parser.parseStringPromise(str);
};

// Underscore has a nice function for this, but we try to go without dependencies
const isEmpty = (thing: unknown): boolean =>
  typeof thing === "object" && thing !== null && Object.keys(thing).length === 0;

const processItem = (processors: ((value: string, name: string) => string)[], item: string, key: string): string => {
  let processedItem = item;
  for (const processor of processors) processedItem = processor(processedItem, key);
  return processedItem;
};

const defineProperty = (object: Record<string, unknown>, key: string, value: unknown): void => {
  // Make sure the descriptor hasn't been prototype polluted
  const descriptor = Object.create(null);
  descriptor.value = value;
  descriptor.writable = true;
  descriptor.enumerable = true;
  descriptor.configurable = true;
  Object.defineProperty(object, key, descriptor);
};
