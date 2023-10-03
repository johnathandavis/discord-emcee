import {
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  BaseMessageOptions
} from 'discord.js';
import {
  EmceeUserInterface,
  StateInput,
  StateValue,
  OptionStateInput,
  BooleanStateInput,
  IOption
} from './Shared';
import { MCSchema, MCRawShape, Infer } from './StateBuilder';

type Component = StringSelectMenuBuilder | ButtonBuilder;
type Row = ActionRowBuilder<Component>;
type Components = Row[];
type SubmitConfig = Exclude<EmceeUserInterface['submit'], undefined>;

function row<T extends Component>(c: T): ActionRowBuilder<T> {
  return new ActionRowBuilder<T>().addComponents(c);
}

export function createUI<T extends MCSchema<MCRawShape>>(
  uiDef: EmceeUserInterface,
  schema: T,
  currentState: Infer<T>,
  validator: (s: Infer<T>) => boolean
): BaseMessageOptions {
  const sd = schema.toStateDefinition();
  const validated = validator(currentState);
  const submitBtn = createSubmit(uiDef.submit ?? {}, validated);
  const components: Components = [];

  sd.inputs.forEach((i) => {
    components.push(row(createUIInput(i, currentState[i.id])));
  });
  components.push(row(submitBtn));
  return {
    content: uiDef.title,
    components: components
  };
}

export const createSubmit = (
  config: SubmitConfig,
  enabled: boolean
): Component => {
  if (!config) {
    config = {};
  }
  return new ButtonBuilder()
    .setLabel(config.buttonText ?? 'Submit')
    .setCustomId('submit')
    .setDisabled(!enabled)
    .setStyle(config.buttonStyle ?? ButtonStyle.Primary);
};

export const createUIInput = (
  input: StateInput,
  currentValue: StateValue
): Component => {
  if (input.type === 'Boolean') {
    return createButton(input, currentValue as boolean);
  } else if (input.type === 'Option') {
    return createOption(input, currentValue as IOption<any>);
  } else {
    throw new Error(`Unknown component type.`);
  }
};

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
      text: i?.trueStyle?.text ?? text,
      style: i?.trueStyle?.style ?? style
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
    .setCustomId('submit')
    .setStyle(style.style);
};

const createOption = (
  input: OptionStateInput,
  currentValue: IOption<any>
): StringSelectMenuBuilder => {
  const selectedValue = currentValue ?? input.value;
  const eb = new StringSelectMenuBuilder().setCustomId(input.id);
  if (input.placeholder) {
    eb.setPlaceholder(input.placeholder!);
  }
  let options = input.values.map((v) => {
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
  });
  console.log('Creating select with value: ' + currentValue);
  eb.addOptions(options);
  return eb;
};
