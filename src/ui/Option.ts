import {
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder
} from 'discord.js';
import { OptionStateInput, IOption } from '../Shared';

const createOption = <T>(
  input: OptionStateInput<T>,
  currentValue?: T[]
): StringSelectMenuBuilder => {
  const selectedValues: Set<T> = new Set<T>(currentValue ?? input.value ?? []);
  const eb = new StringSelectMenuBuilder().setCustomId(input.id);
  if (input.placeholder) {
    eb.setPlaceholder(input.placeholder!);
  }
  let options = input.options.map((v) =>
    createOptionValue<T>(v, selectedValues)
  );
  eb.addOptions(options);
  eb.setDisabled(input.disabled ?? false);
  if (input.minValues) {
    eb.setMinValues(input.minValues);
  }
  if (input.maxValues) {
    eb.setMaxValues(input.maxValues);
  }
  return eb;
};

function createOptionValue<T>(
  v: IOption<T>,
  selectedValuesSet: Set<T>
): StringSelectMenuOptionBuilder {
  let b = new StringSelectMenuOptionBuilder();
  const strResult = `${v.result}`;
  b.setLabel(v.label ?? strResult);
  b.setValue(v.value ?? strResult);
  if (v.description) {
    b.setDescription(v.description);
  }
  if (selectedValuesSet.has(v.result)) {
    b.setDefault(true);
  }
  return b;
}

export { createOption, createOptionValue };
