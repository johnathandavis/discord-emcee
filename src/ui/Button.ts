import {
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import {
  BooleanStateInput,
} from '../Shared';

type ButtonStyleConfig = Required<
  Exclude<BooleanStateInput['trueStyle'], undefined>
>;
const getStyle = (
  i: BooleanStateInput,
  currentValue: boolean
): ButtonStyleConfig => {
  let s: ButtonStyleConfig | undefined;
  if (currentValue) {
    let text = 'True';
    let style = ButtonStyle.Primary;
    return {
      text: i?.trueStyle?.text ?? text,
      style: i?.trueStyle?.style ?? style
    };
  } else {
    let text = 'False';
    let style = ButtonStyle.Danger;
    return {
      text: i?.falseStyle?.text ?? text,
      style: i?.falseStyle?.style ?? style
    };
  }
};

const createButton = (
  input: BooleanStateInput,
  currentValue: boolean
): ButtonBuilder => {
  let style = getStyle(input, currentValue);
  return new ButtonBuilder()
    .setLabel(style.text)
    .setCustomId(input.id)
    .setStyle(style.style);
};

export {
  createButton
}