import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { countdownPropsSchema } from "#shared/models/pageBuilder/webpage/CountdownProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";
import { createText } from "#shared/services/pageBuilder/html/createText";
import {
  COUNTDOWN_CLASS,
  COUNTDOWN_CSS,
  COUNTDOWN_DIGIT_CLASS,
  COUNTDOWN_SCRIPT,
  COUNTDOWN_UNIT_CLASS,
  COUNTDOWN_UNITS,
  DEFAULT_COUNTDOWN_DAYS,
  DEFAULT_COUNTDOWN_END_TEXT,
} from "#shared/services/pageBuilder/webpage/countdown/constants";

export const CountdownDefinition = {
  createProps: () => {
    const date = new Date();
    date.setDate(date.getDate() + DEFAULT_COUNTDOWN_DAYS);
    return { date: date.toISOString().slice(0, 10), endText: DEFAULT_COUNTDOWN_END_TEXT, style: {} };
  },
  createPropsSchema: () => countdownPropsSchema,
  css: COUNTDOWN_CSS,
  // A timer's live region stays off, so a reader is not interrupted every second
  render: ({ date, endText }) =>
    createElement(
      ElementTag.Division,
      {
        [ElementAttribute.AriaLive]: "off",
        [ElementAttribute.Class]: COUNTDOWN_CLASS,
        [ElementAttribute.DataDate]: date,
        [ElementAttribute.DataEndText]: endText,
        [ElementAttribute.Role]: "timer",
      },
      COUNTDOWN_UNITS.map((unit) =>
        createElement(ElementTag.Division, { [ElementAttribute.Class]: COUNTDOWN_UNIT_CLASS }, [
          createElement(ElementTag.Division, { [ElementAttribute.Class]: COUNTDOWN_DIGIT_CLASS }, [createText("00")]),
          createElement(ElementTag.Division, {}, [createText(unit)]),
        ]),
      ),
    ),
  script: COUNTDOWN_SCRIPT,
  slots: {},
  type: WebpageNodeType.Countdown,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Countdown>;
