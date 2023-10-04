import {
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder
} from 'discord.js';
import { OptionStateInput, IOption } from '../Shared';

const createOption = (
  input: OptionStateInput,
  currentValue?: IOption<any>
): StringSelectMenuBuilder => {
  const selectedValue = currentValue?.result ?? input.value;
  const eb = new StringSelectMenuBuilder().setCustomId(input.id);
  if (input.placeholder) {
    eb.setPlaceholder(input.placeholder!);
  }
  let options = input.values.map((v) => createOptionValue(v, selectedValue));
  eb.addOptions(options);
  return eb;
};

function createOptionValue<T>(
  v: IOption<T>,
  selectedValue: T
): StringSelectMenuOptionBuilder {
  let b = new StringSelectMenuOptionBuilder();
  const strResult = `${v.result}`;
  b.setLabel(v.label ?? strResult);
  b.setValue(v.value ?? strResult);
  if (v.description) {
    b.setDescription(v.description);
  }
  if (v.result === selectedValue) {
    b.setDefault(true);
  }
  return b;
}

export { createOption, createOptionValue };
