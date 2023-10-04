import {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  BaseMessageOptions
} from 'discord.js';
import {
  EmceeUserInterface,
  StateInput,
  StateValue,
  IOption,
  OptionStateInput,
  BooleanStateInput
} from '../Shared';
import { createButton } from './Button';
import { createOption } from './Option';
import { createSubmit } from './Submit';
import { MCSchema, MCRawShape, Infer } from '../StateBuilder';

type Component = StringSelectMenuBuilder | ButtonBuilder;
type Row = ActionRowBuilder<Component>;
type Components = Row[];

type ComponentBuildFor<T extends StateInput> = T extends OptionStateInput
  ? StringSelectMenuBuilder
  : T extends BooleanStateInput
  ? ButtonBuilder
  : never;

type InputFactory = {
  [IT in StateInput as IT['type']]: (
    i: IT,
    v: IT['value']
  ) => ComponentBuildFor<IT>;
};

function row<T extends Component>(c: T): ActionRowBuilder<T> {
  return new ActionRowBuilder<T>().addComponents(c);
}

const defaultInstanceFactory: InputFactory = {
  Boolean: (b: BooleanStateInput, currentValue: boolean | undefined) => {
    return createButton(b, currentValue ?? false);
  },
  Option: (b: OptionStateInput, currentValue: any | undefined) => {
    return createOption(b, currentValue);
  }
};

function createUI<T extends MCSchema<MCRawShape>>(
  uiDef: EmceeUserInterface,
  schema: T,
  currentState: Infer<T>,
  validator: (s: Infer<T>) => boolean,
  inputFactory?: InputFactory
): BaseMessageOptions {
  const iff = inputFactory ?? defaultInstanceFactory;
  const sd = schema.toStateDefinition();
  const validated = validator(currentState);
  const submitBtn = createSubmit(uiDef.submit ?? {}, validated);
  const components: Components = [];

  sd.inputs.forEach((i) => {
    const iffFunc = iff[i.type] as (
      i: StateInput,
      v: any | undefined
    ) => Component;
    components.push(row(iffFunc(i, currentState[i.id])));
  });
  components.push(row(submitBtn));
  return {
    content: uiDef.title,
    components: components
  };
}

const createUIInput = (
  input: StateInput,
  currentValue: StateValue
): Component => {
  if (input.type === 'Boolean') {
    return createButton(input, currentValue as boolean);
  } else {
    return createOption(input, currentValue as IOption<any>);
  }
};

export { createUI, createUIInput };
export type { InputFactory, Component, Row };
