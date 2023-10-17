import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { StringStateInput } from '../Shared';

const DefaultStyle: TextInputStyle = TextInputStyle.Short;

const createString = (input: StringStateInput): TextInputBuilder => {
  let eb = new TextInputBuilder().setCustomId(input.id).setLabel(input.label);
  if (input.value) {
    eb.setValue(input.value);
  }
  eb.setStyle(input.style ? input.style! : DefaultStyle);
  if (input.minLength) eb.setMinLength(input.minLength!);
  if (input.maxLength) eb.setMaxLength(input.maxLength!);
  if (input.required !== undefined && input.required !== null) {
    eb.setRequired(input.required);
  } else {
    eb.setRequired(true);
  }
  if (input.placeholder) {
    eb.setPlaceholder(input.placeholder);
  }
  return eb;
};

export { createString };
