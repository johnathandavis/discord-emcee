import {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  BaseMessageOptions,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  TextInputBuilder
} from 'discord.js';
import {
  MCStateInput,
  OptionStateInput,
  BooleanStateInput,
  UserStateInput,
  User,
  ChannelStateInput,
  Channel,
  RoleStateInput,
  MentionableStateInput,
  Mentionable,
  Role
} from '../Shared';
import { InlineMessagePromptOptions } from '../prompts/Shared';
import { createButton } from './Button';
import { createOption } from './Option';
import { createSubmit } from './Submit';
import {
  createChannelSelect,
  createMentionableSelect,
  createRoleSelect,
  createUserSelect,
  ExtendedBuilder
} from './DiscordSelectables';
import { MCSchema, Infer } from '../schema/SchemaBuilder';

type Component =
  | StringSelectMenuBuilder
  | UserSelectMenuBuilder
  | RoleSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ChannelSelectMenuBuilder
  | ButtonBuilder;
type Row = ActionRowBuilder<Component>;
type Components = Row[];

type MCComponentBuildFor<T extends MCStateInput> = T extends OptionStateInput
  ? StringSelectMenuBuilder
  : T extends BooleanStateInput
  ? ButtonBuilder
  : T extends UserStateInput
  ? ExtendedBuilder<'user'>
  : T extends ChannelStateInput
  ? ExtendedBuilder<'channel'>
  : T extends RoleStateInput
  ? ExtendedBuilder<'role'>
  : T extends MentionableStateInput
  ? ExtendedBuilder<'mentionable'>
  : never;

type InputFactory = {
  [IT in MCStateInput as IT['type']]: (
    i: IT,
    v: IT['value']
  ) => MCComponentBuildFor<IT>;
};

const defaultMCInstanceFactory: InputFactory = {
  Boolean: (b: BooleanStateInput, currentValue: boolean | undefined) => {
    return createButton(b, currentValue ?? false);
  },
  Option: (b: OptionStateInput, currentValue: any | undefined) => {
    return createOption(b, currentValue);
  },
  User: (b: UserStateInput, currentValue: User[] | undefined) => {
    return createUserSelect(b, currentValue);
  },
  Channel: (b: ChannelStateInput, currentValue: Channel[] | undefined) => {
    return createChannelSelect(b, currentValue);
  },
  Role: (b: RoleStateInput, currentValue: Role[] | undefined) => {
    return createRoleSelect(b, currentValue);
  },
  Mentionable: (
    b: MentionableStateInput,
    currentValue: Mentionable[] | undefined
  ) => {
    return createMentionableSelect(b, currentValue);
  }
};

function createComponentUI<T extends MCSchema<any>>(
  uiDef: InlineMessagePromptOptions,
  schema: T,
  currentState: Infer<T>,
  validator: (s: Infer<T>) => boolean,
  inputFactory?: InputFactory
): BaseMessageOptions {
  const iff = inputFactory ?? defaultMCInstanceFactory;
  const sd = schema.toStateDefinition();
  console.log(`State:`);
  console.log(currentState);
  const validated = validator(currentState);
  const submitBtn = createSubmit(uiDef.submit ?? {}, validated);
  const components: Components = [];

  sd.inputs.forEach((i) => {
    const iffFunc = iff[i.type] as (
      i: MCStateInput,
      v: any | undefined
    ) => Component;
    components.push(row(iffFunc(i, currentState[i.id])));
  });
  components.push(row(submitBtn));
  const ui = {
    content: uiDef.title,
    components: components
  };
  console.log('UI:');
  console.log(JSON.stringify(ui));
  return ui;
}

function row<T extends Component>(c: T): ActionRowBuilder<T> {
  return new ActionRowBuilder<T>().addComponents(c);
}

export { createComponentUI, defaultMCInstanceFactory };
export type { InputFactory, Component, Row };
