import type { FormsPluginOptions } from "@/models/webpageEditor/FormsPluginOptions";
import type { BlockProperties, Component, Editor, Plugin } from "grapesjs";

const FORM_TYPE = "form";
const INPUT_TYPE = "input";
const TEXTAREA_TYPE = "textarea";
const OPTION_TYPE = "option";
const SELECT_TYPE = "select";
const CHECKBOX_TYPE = "checkbox";
const RADIO_TYPE = "radio";
const BUTTON_TYPE = "button";
const LABEL_TYPE = "label";
const SELECT_OPTIONS_TRAIT = "select-options";

const BUTTON_DEFAULT_TEXT = "Send";
const LABEL_DEFAULT_TEXT = "Label";
const OPTION_SEPARATOR = "::";
const DEFAULT_BLOCK_IDS = [
  FORM_TYPE,
  INPUT_TYPE,
  TEXTAREA_TYPE,
  SELECT_TYPE,
  BUTTON_TYPE,
  LABEL_TYPE,
  CHECKBOX_TYPE,
  RADIO_TYPE,
];

const ID_TRAIT = { name: "id" };
const FOR_TRAIT = { name: "for" };
const NAME_TRAIT = { name: "name" };
const PLACEHOLDER_TRAIT = { name: "placeholder" };
const VALUE_TRAIT = { name: "value" };
const REQUIRED_TRAIT = { name: "required", type: "checkbox" };
const CHECKED_TRAIT = { name: "checked", type: "checkbox" };

// The options trait writes one "value::label" line per option, and reads them back the same way
const getOptionsText = (select: Component) =>
  select
    .components()
    .models.map((option) => {
      const value: string = option.get("attributes")?.value || "";
      const label: string = option.components().models[0]?.get("content") || "";

      return `${value}${OPTION_SEPARATOR}${label}`;
    })
    .join("\n");

// A label keeps everything after its first separator, so a label that itself contains "::" is not cut short
const parseOptionLine = (line: string) => {
  const [value = "", ...labelParts] = line.split(OPTION_SEPARATOR);
  const label = labelParts.join(OPTION_SEPARATOR);

  return { label: label || value, value };
};

// The label is a text node child, the shape the options trait reads back; a string on the option itself is not
const createOption = (value: string, label: string) => ({
  attributes: { value },
  components: label,
  type: OPTION_TYPE,
});

// The options trait reads and writes through one textarea per trait view, so the element is kept on that view
const optionsTextInputs = new WeakMap<object, HTMLTextAreaElement>();

export const formsPlugin: Plugin<FormsPluginOptions> = (editor: Editor, options) => {
  const { block = () => ({}), blocks = DEFAULT_BLOCK_IDS, category = { id: "forms", label: "Forms" } } = options;

  const addBlock = (id: string, properties: BlockProperties) => {
    if (blocks.includes(id)) editor.Blocks.add(id, { ...properties, category, select: true, ...block(id) });
  };

  editor.TraitManager.addType(SELECT_OPTIONS_TRAIT, {
    events: { keyup: "onChange" },

    getInputEl() {
      const cached = optionsTextInputs.get(this);

      if (cached) return cached;

      const element = window.document.createElement("textarea");
      element.value = getOptionsText(this.target);
      optionsTextInputs.set(this, element);

      return element;
    },

    onValueChange() {
      const lines = String(this.model.get("value")).trim().split("\n");

      this.target.components().reset(
        lines.map((line) => {
          const { label, value } = parseOptionLine(line);

          return createOption(value, label);
        }),
      );
      this.target.view?.render();
    },
  });

  // A view's handler is typed by what it calls, as Backbone hands it its own wrapped event rather than the DOM one
  const checkIfInPreview = (event: Pick<Event, "preventDefault">) => {
    if (!editor.Commands.isActive("preview")) event.preventDefault();
  };

  editor.Components.addType(FORM_TYPE, {
    isComponent: (element) => element.tagName === "FORM",

    model: {
      defaults: {
        attributes: { method: "get" },
        draggable: ":not(form)",
        droppable: ":not(form)",
        tagName: "form",
        traits: [
          {
            name: "method",
            options: [
              { id: "get", label: "GET" },
              { id: "post", label: "POST" },
            ],
            type: "select",
          },
          { name: "action" },
        ],
      },
    },

    view: {
      events: () => ({
        // The submit of the form might redirect the user from the editor, so the default is always prevented
        submit: (event: Pick<Event, "preventDefault">) => {
          event.preventDefault();
        },
      }),
    },
  });

  editor.Components.addType(INPUT_TYPE, {
    extendFnView: ["updateAttributes"],

    isComponent: (element) => element.tagName === "INPUT",

    model: {
      defaults: {
        attributes: { type: "text" },
        droppable: false,
        highlightable: false,
        tagName: "input",
        traits: [
          ID_TRAIT,
          NAME_TRAIT,
          PLACEHOLDER_TRAIT,
          {
            name: "type",
            options: [{ id: "text" }, { id: "email" }, { id: "password" }, { id: "number" }],
            type: "select",
          },
          REQUIRED_TRAIT,
        ],
      },
    },
    view: {
      updateAttributes() {
        this.el.setAttribute("autocomplete", "off");
      },
    },
  });

  editor.Components.addType(TEXTAREA_TYPE, {
    extend: INPUT_TYPE,
    isComponent: (element) => element.tagName === "TEXTAREA",

    model: {
      defaults: {
        attributes: {},
        tagName: "textarea",
        traits: [ID_TRAIT, NAME_TRAIT, PLACEHOLDER_TRAIT, REQUIRED_TRAIT],
      },
    },
  });

  editor.Components.addType(OPTION_TYPE, {
    isComponent: (element) => element.tagName === "OPTION",

    model: {
      defaults: { draggable: false, droppable: false, highlightable: false, layerable: false, tagName: "option" },
    },
  });

  editor.Components.addType(SELECT_TYPE, {
    isComponent: (element) => element.tagName === "SELECT",

    model: {
      defaults: {
        components: [createOption("opt1", "Option 1"), createOption("opt2", "Option 2")],
        droppable: false,
        highlightable: false,
        tagName: "select",
        traits: [ID_TRAIT, NAME_TRAIT, { name: "options", type: SELECT_OPTIONS_TRAIT }, REQUIRED_TRAIT],
      },
    },

    view: { events: () => ({ mousedown: checkIfInPreview }) },
  });

  editor.Components.addType(CHECKBOX_TYPE, {
    extend: INPUT_TYPE,
    isComponent: (element) => element.tagName === "INPUT" && "type" in element && element.type === CHECKBOX_TYPE,

    model: {
      defaults: {
        attributes: { type: CHECKBOX_TYPE },
        copyable: false,
        traits: [ID_TRAIT, NAME_TRAIT, VALUE_TRAIT, REQUIRED_TRAIT, CHECKED_TRAIT],
      },
    },

    view: {
      events: () => ({ click: checkIfInPreview }),

      handleChecked() {
        if ("checked" in this.el) this.el.checked = Boolean(this.model.get("attributes")?.checked);
      },

      init() {
        this.listenTo(this.model, "change:attributes:checked", this.handleChecked);
      },
    },
  });

  editor.Components.addType(RADIO_TYPE, {
    extend: CHECKBOX_TYPE,
    isComponent: (element) => element.tagName === "INPUT" && "type" in element && element.type === RADIO_TYPE,

    model: { defaults: { attributes: { type: RADIO_TYPE } } },
  });

  editor.Components.addType(BUTTON_TYPE, {
    extend: INPUT_TYPE,
    isComponent: (element) => element.tagName === "BUTTON",

    model: {
      defaults: {
        attributes: { type: "button" },
        tagName: "button",
        text: BUTTON_DEFAULT_TEXT,
        traits: [
          // Changing the text rebuilds the children only on change, so typing does not blur the trait's input
          { changeProp: true, name: "text" },
          { name: "type", options: [{ id: "button" }, { id: "submit" }, { id: "reset" }], type: "select" },
        ],
      },

      init() {
        const components = this.components();
        const textChild = components.length === 1 && components.models[0];
        const childContent: string = (textChild && textChild.is("textnode") && textChild.get("content")) || "";
        const text: string = childContent || this.get("text");

        this.set("text", text);
        this.on("change:text", this.onTextChange);

        if (text !== childContent) this.onTextChange();
      },

      onTextChange() {
        this.components(this.get("text"));
      },
    },

    view: { events: () => ({ click: checkIfInPreview }) },
  });

  editor.Components.addType(LABEL_TYPE, {
    extend: "text",
    isComponent: (element) => element.tagName === "LABEL",

    model: { defaults: { components: LABEL_DEFAULT_TEXT, tagName: "label", traits: [FOR_TRAIT] } },
  });

  addBlock(FORM_TYPE, {
    content: {
      components: [
        { components: [{ components: "Name", type: LABEL_TYPE }, { type: INPUT_TYPE }] },
        {
          components: [
            { components: "Email", type: LABEL_TYPE },
            { attributes: { type: "email" }, type: INPUT_TYPE },
          ],
        },
        {
          components: [
            { components: "Gender", type: LABEL_TYPE },
            { attributes: { value: "M" }, type: CHECKBOX_TYPE },
            { components: "M", type: LABEL_TYPE },
            { attributes: { value: "F" }, type: CHECKBOX_TYPE },
            { components: "F", type: LABEL_TYPE },
          ],
        },
        { components: [{ components: "Message", type: LABEL_TYPE }, { type: TEXTAREA_TYPE }] },
        { components: [{ type: BUTTON_TYPE }] },
      ],
      type: FORM_TYPE,
    },
    label: "Form",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5.5c0-.3-.5-.5-1.3-.5H3.4c-.8 0-1.3.2-1.3.5v3c0 .3.5.5 1.3.5h17.4c.8 0 1.3-.2 1.3-.5v-3zM21 8H3V6h18v2zM22 10.5c0-.3-.5-.5-1.3-.5H3.4c-.8 0-1.3.2-1.3.5v3c0 .3.5.5 1.3.5h17.4c.8 0 1.3-.2 1.3-.5v-3zM21 13H3v-2h18v2z"/><rect width="10" height="3" x="2" y="15" rx=".5"/></svg>',
  });

  addBlock(INPUT_TYPE, {
    content: { type: INPUT_TYPE },
    label: "Input",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 9c0-.6-.5-1-1.3-1H3.4C2.5 8 2 8.4 2 9v6c0 .6.5 1 1.3 1h17.4c.8 0 1.3-.4 1.3-1V9zm-1 6H3V9h18v6z"/><path d="M4 10h1v4H4z"/></svg>',
  });

  addBlock(TEXTAREA_TYPE, {
    content: { type: TEXTAREA_TYPE },
    label: "Textarea",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 7.5c0-.9-.5-1.5-1.3-1.5H3.4C2.5 6 2 6.6 2 7.5v9c0 .9.5 1.5 1.3 1.5h17.4c.8 0 1.3-.6 1.3-1.5v-9zM21 17H3V7h18v10z"/><path d="M4 8h1v4H4zM19 7h1v10h-1zM20 8h1v1h-1zM20 15h1v1h-1z"/></svg>',
  });

  addBlock(SELECT_TYPE, {
    content: { type: SELECT_TYPE },
    label: "Select",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 9c0-.6-.5-1-1.3-1H3.4C2.5 8 2 8.4 2 9v6c0 .6.5 1 1.3 1h17.4c.8 0 1.3-.4 1.3-1V9zm-1 6H3V9h18v6z"/><path d="M18.5 13l1.5-2h-3zM4 11.5h11v1H4z"/></svg>',
  });

  addBlock(BUTTON_TYPE, {
    content: { type: BUTTON_TYPE },
    label: "Button",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 9c0-.6-.5-1-1.3-1H3.4C2.5 8 2 8.4 2 9v6c0 .6.5 1 1.3 1h17.4c.8 0 1.3-.4 1.3-1V9zm-1 6H3V9h18v6z"/><path d="M4 11.5h16v1H4z"/></svg>',
  });

  addBlock(LABEL_TYPE, {
    content: { type: LABEL_TYPE },
    label: "Label",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 11.9c0-.6-.5-.9-1.3-.9H3.4c-.8 0-1.3.3-1.3.9V17c0 .5.5.9 1.3.9h17.4c.8 0 1.3-.4 1.3-.9V12zM21 17H3v-5h18v5z"/><rect width="14" height="5" x="2" y="5" rx=".5"/><path d="M4 13h1v3H4z"/></svg>',
  });

  addBlock(CHECKBOX_TYPE, {
    content: { type: CHECKBOX_TYPE },
    label: "Checkbox",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 17l-5-5 1.41-1.42L10 14.17l7.59-7.59L19 8m0-5H5c-1.11 0-2 .89-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2z"></path></svg>',
  });

  addBlock(RADIO_TYPE, {
    content: { type: RADIO_TYPE },
    label: "Radio",
    media:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"></path></svg>',
  });
};
