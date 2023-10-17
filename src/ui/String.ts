import { TextInputBuilder } from 'discord.js';
import { StringStateInput } from '../Shared';

const createString = (
  input: StringStateInput,
  currentValue: string
): TextInputBuilder => {
  return new TextInputBuilder().setCustomId(input.id);
};

export { createString };
