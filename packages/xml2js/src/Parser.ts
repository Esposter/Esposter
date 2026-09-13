import type { QualifiedAttribute, QualifiedTag, SAXParser } from "sax";
import type { convertableToString, ParserOptions } from "xml2js";

import { checkIsEmpty } from "#src/checkIsEmpty";
import { BUILTIN_NAME_KEY, TEXT_NODE_NAME } from "#src/constants";
import { DefaultParserOptions } from "#src/DefaultParserOptions";
import { defineProperty } from "#src/defineProperty";
import { processItem } from "#src/processItem";
import { stripBOM } from "#src/stripBOM";
import { takeOne } from "@esposter/shared";
import { parser } from "sax";

const BLANK_REGEX = /^\s*$/u;
const WHITESPACE_RUN_REGEX = /\s{2,}/gu;

export class Parser {
  get xmlnsKey(): string {
    return `${this.#options.attrkey}ns`;
  }

  readonly #options: typeof DefaultParserOptions = structuredClone(DefaultParserOptions);
  #resultObject: Record<string, unknown> | string = {};
  readonly #saxParser: SAXParser;
  readonly #stack: Record<string, unknown>[] = [];

  constructor(init?: Partial<ParserOptions>) {
    Object.assign(this.#options, init);

    if (this.#options.normalizeTags) {
      this.#options.tagNameProcessors ??= [];
      this.#options.tagNameProcessors.unshift((tagName) => tagName.toLowerCase());
    }

    this.#saxParser = parser(this.#options.strict, { normalize: false, trim: false, xmlns: this.#options.xmlns });
    this.#saxParser.onerror = () => {
      this.#saxParser.resume();
    };
    this.#saxParser.onopentag = (node) => {
      const newObject: Record<string, unknown> = {
        [this.#options.charkey]: "",
      };
      if (!this.#options.ignoreAttrs)
        for (const [key, attribute] of Object.entries<QualifiedAttribute | string>(node.attributes)) {
          if (!(this.#options.attrkey in newObject) && !this.#options.mergeAttrs) newObject[this.#options.attrkey] = {};

          // Under xmlns sax hands over a qualified attribute, and it is the value it wraps that a processor takes
          const attributeValue = typeof attribute === "string" ? attribute : attribute.value;
          const newValue = this.#options.attrValueProcessors
            ? processItem(this.#options.attrValueProcessors, attributeValue, key)
            : attribute;
          const processedKey = this.#options.attrNameProcessors
            ? processItem(this.#options.attrNameProcessors, key, "")
            : key;
          if (this.#options.mergeAttrs) this.#assignOrPush(newObject, processedKey, newValue);
          else defineProperty(newObject[this.#options.attrkey] as Record<string, unknown>, processedKey, newValue);
        }
      newObject[BUILTIN_NAME_KEY] = this.#options.tagNameProcessors
        ? processItem(this.#options.tagNameProcessors, node.name, "")
        : node.name;
      if (this.#options.xmlns)
        newObject[this.xmlnsKey] = { local: (node as QualifiedTag).local, uri: (node as QualifiedTag).uri };

      this.#stack.push(newObject);
    };
    this.#saxParser.onclosetag = () => {
      // A closed tag is an object until the empty-tag substitution, after which it is whatever `emptyTag` says —
      // The string default included — which is the shape the result object already declares
      let object: Record<string, unknown> | string | undefined = this.#stack.pop();
      if (!object) return;

      const nodeName = object[BUILTIN_NAME_KEY] as string;
      if (!(this.#options.explicitChildren && this.#options.preserveChildrenOrder)) delete object[BUILTIN_NAME_KEY];

      let cdata = false;
      if (object.cdata === true) {
        cdata = object.cdata;
        delete object.cdata;
      }

      const nextObject = this.#stack.at(-1);
      let emptyString = "";
      // Remove the '#' key altogether if it's blank
      const char = object[this.#options.charkey] as string;
      if (BLANK_REGEX.test(char) && !cdata) {
        emptyString = char;
        delete object[this.#options.charkey];
      } else {
        // Each step reads the previous step's output, so trim, normalize and the value processors compose
        let charValue = char;
        if (this.#options.trim) charValue = charValue.trim();
        if (this.#options.normalize) charValue = charValue.replaceAll(WHITESPACE_RUN_REGEX, " ").trim();

        object[this.#options.charkey] = this.#options.valueProcessors
          ? processItem(this.#options.valueProcessors, charValue, nodeName)
          : charValue;
        object = this.#collapseCharKey(object);
      }

      if (checkIsEmpty(object))
        if (typeof this.#options.emptyTag === "function") object = this.#options.emptyTag();
        else object = this.#options.emptyTag || emptyString;

      if (this.#options.validator) {
        const xpath = `/${[...this.#stack.map((node) => node[BUILTIN_NAME_KEY]), nodeName].join("/")}`;
        object = this.#options.validator(xpath, nextObject?.[nodeName], object);
      }
      // Put children into the <childkey> property and unfold chars if necessary.
      if (this.#options.explicitChildren && !this.#options.mergeAttrs && typeof object === "object")
        if (!this.#options.preserveChildrenOrder) {
          const node: Record<string, unknown> = {};
          // Separate attributes
          if (this.#options.attrkey in object) {
            node[this.#options.attrkey] = object[this.#options.attrkey];
            delete object[this.#options.attrkey];
          }
          // Separate char data
          if (!this.#options.charsAsChildren && this.#options.charkey in object) {
            node[this.#options.charkey] = object[this.#options.charkey];
            delete object[this.#options.charkey];
          }

          if (Object.getOwnPropertyNames(object).length > 0) node[this.#options.childkey] = object;

          object = node;
        } else if (nextObject) {
          // Append current node onto parent's <childKey> array
          nextObject[this.#options.childkey] ??= [];
          // Push a clone so the child entry can carry the #name property while the original goes without.
          (nextObject[this.#options.childkey] as Record<string, unknown>[]).push(structuredClone(object));
          delete object[BUILTIN_NAME_KEY];
          object = this.#collapseCharKey(object);
        }
      // Check whether we closed all the open tags
      if (this.#stack.length > 0) this.#assignOrPush(nextObject ?? {}, nodeName, object);
      else {
        // Under explicitRoot the result is wrapped in an object keyed by the root tag name
        if (this.#options.explicitRoot) {
          // Avoid circular references
          const oldObject = object;
          object = {};
          defineProperty(object, nodeName, oldObject);
        }

        this.#resultObject = object ?? {};
      }
    };

    const ontext = (text: string): Record<string, unknown> | undefined => {
      const object = this.#stack.at(-1);
      if (!object) return undefined;

      object[this.#options.charkey] += text;

      if (
        this.#options.explicitChildren &&
        this.#options.preserveChildrenOrder &&
        this.#options.charsAsChildren &&
        (this.#options.includeWhiteChars || Boolean(text.replaceAll(String.raw`\n`, "").trim()))
      ) {
        object[this.#options.childkey] ??= [];
        const charChild: Record<string, string> = {
          [BUILTIN_NAME_KEY]: TEXT_NODE_NAME,
          [this.#options.charkey]: text,
        };
        if (this.#options.normalize)
          charChild[this.#options.charkey] = takeOne(charChild, this.#options.charkey)
            .replaceAll(WHITESPACE_RUN_REGEX, " ")
            .trim();

        (object[this.#options.childkey] as Record<string, string>[]).push(charChild);
      }

      return object;
    };

    this.#saxParser.ontext = (text) => {
      ontext(text);
    };
    this.#saxParser.oncdata = (cdata) => {
      const object = ontext(cdata);
      if (!object) return;
      object.cdata = true;
    };
  }

  parseStringPromise<T>(convertableToString: convertableToString): Promise<T> {
    return new Promise<T>((resolve) => {
      this.#parseString(convertableToString, resolve);
    });
  }

  #assignOrPush(object: Record<string, unknown>, key: string, newValue: unknown): void {
    if (key in object) {
      const objectValue = object[key];
      if (Array.isArray(objectValue)) objectValue.push(newValue);
      else defineProperty(object, key, [objectValue]);
    } else if (this.#options.explicitArray) defineProperty(object, key, [newValue]);
    else defineProperty(object, key, newValue);
  }

  // A node whose only key is the char data is the char data: `<a>b</a>` parses to "b", not to { _: "b" }
  #collapseCharKey(object: Record<string, unknown>): Record<string, unknown> {
    if (Object.keys(object).length === 1 && this.#options.charkey in object)
      return object[this.#options.charkey] as Record<string, unknown>;
    return object;
  }
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
  #parseString<T>(convertableToString: convertableToString, callback: (result: T) => void): SAXParser {
    const string = stripBOM(convertableToString.toString());
    this.#saxParser.onend = () => {
      callback(this.#resultObject as T);
      this.#resultObject = {};
    };
    return this.#saxParser.write(string).close();
  }
}
