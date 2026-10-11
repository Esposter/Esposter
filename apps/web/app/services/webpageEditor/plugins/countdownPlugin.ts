import type { Plugin } from "grapesjs";

interface CountdownElement extends HTMLElement {
  countdownTimer?: number;
}

const COUNTDOWN_ID = "countdown";
const CLASS_PREFIX = "countdown";

// Serialised by grapesjs with `toString()` and run in the canvas, so it must stay self-contained:
// No reference to anything outside its own body
const countdownScript = function (this: CountdownElement, props: { endText: string; startfrom: string }) {
  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;

  clearInterval(this.countdownTimer);

  // A date-only value is local midnight of that day, as the trait's date input means it, not the UTC midnight
  // `new Date` reads it as; the date and time forms are parsed field by field, since Safari rejects the space form
  const groups = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})(?:[T ](?<hour>\d{2}):(?<minute>\d{2}))?$/u.exec(
    props.startfrom,
  )?.groups;
  const endAt = groups
    ? new Date(
        Number(groups.year),
        Number(groups.month) - 1,
        Number(groups.day),
        Number(groups.hour ?? 0),
        Number(groups.minute ?? 0),
      ).getTime()
    : new Date(props.startfrom).getTime();

  const dayElement = this.querySelector<HTMLElement>("[data-js=countdown-day]");
  const hourElement = this.querySelector<HTMLElement>("[data-js=countdown-hour]");
  const minuteElement = this.querySelector<HTMLElement>("[data-js=countdown-minute]");
  const secondElement = this.querySelector<HTMLElement>("[data-js=countdown-second]");
  const counterElement = this.querySelector<HTMLElement>("[data-js=countdown]");
  const endTextElement = this.querySelector<HTMLElement>("[data-js=countdown-endtext]");
  if (!dayElement || !hourElement || !minuteElement || !secondElement || !counterElement || !endTextElement) return;

  const renderDigits = (days: number, hours: number, minutes: number, seconds: number) => {
    dayElement.textContent = String(days).padStart(2, "0");
    hourElement.textContent = String(hours).padStart(2, "0");
    minuteElement.textContent = String(minutes).padStart(2, "0");
    secondElement.textContent = String(seconds).padStart(2, "0");
  };
  // Returns whether the countdown is still running; an unparseable start shows zeros and never ticks
  const moveTimer = () => {
    const distance = endAt - Date.now();
    if (Number.isNaN(distance)) {
      renderDigits(0, 0, 0, 0);
      return false;
    }

    if (distance < 0) {
      clearInterval(this.countdownTimer);
      endTextElement.textContent = props.endText;
      counterElement.style.display = "none";
      endTextElement.style.display = "";
      return false;
    }

    renderDigits(
      Math.floor(distance / day),
      Math.floor((distance % day) / hour),
      Math.floor((distance % hour) / minute),
      Math.floor((distance % minute) / second),
    );
    return true;
  };

  endTextElement.style.display = "none";
  counterElement.style.display = "";
  if (!moveTimer()) return;

  // A re-rendered component detaches its old element, and nothing else would stop that element's timer
  this.countdownTimer = window.setInterval(() => {
    if (!this.isConnected) {
      clearInterval(this.countdownTimer);
      return;
    }

    moveTimer();
  }, second);
};

const countdownStyle = `
  .${CLASS_PREFIX} {
    text-align: center;
  }

  .${CLASS_PREFIX}-block {
    display: inline-block;
    margin: 0 10px;
    padding: 10px;
  }

  .${CLASS_PREFIX}-digit {
    font-size: 5rem;
  }

  .${CLASS_PREFIX}-endtext {
    font-size: 5rem;
  }

  .${CLASS_PREFIX}-cont {
    display: inline-block;
  }
`;

const countdownUnit = (name: string, label: string) => `
            <div class="${CLASS_PREFIX}-block">
              <div data-js="countdown-${name}" class="${CLASS_PREFIX}-digit"></div>
              <div class="${CLASS_PREFIX}-label">${label}</div>
            </div>`;

const countdownComponents = `
          <span data-js="countdown" class="${CLASS_PREFIX}-cont">${countdownUnit("day", "days")}${countdownUnit("hour", "hours")}${countdownUnit("minute", "minutes")}${countdownUnit("second", "seconds")}
          </span>
          <span data-js="countdown-endtext" class="${CLASS_PREFIX}-endtext"></span>
        `;

export const countdownPlugin: Plugin = (editor) => {
  editor.Blocks.add(COUNTDOWN_ID, {
    category: "Extra",
    content: { type: COUNTDOWN_ID },
    label: "Countdown",
    media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 20C16.4 20 20 16.4 20 12S16.4 4 12 4 4 7.6 4 12 7.6 20 12 20M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2M17 11.5V13H11V7H12.5V11.5H17Z" />
      </svg>`,
    select: true,
  });

  editor.Components.addType(COUNTDOWN_ID, {
    model: {
      defaults: {
        "script-props": ["startfrom", "endText"],
        classes: [CLASS_PREFIX],
        components: countdownComponents,
        droppable: false,
        endText: "EXPIRED",
        script: countdownScript,
        startfrom: "",
        styles: countdownStyle,
        traits: [
          { changeProp: true, label: "Start", name: "startfrom", type: "date" },
          { changeProp: true, label: "End text", name: "endText" },
        ],
      },
    },
  });
};
