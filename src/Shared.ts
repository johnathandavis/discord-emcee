import {
  ButtonStyle,
  ButtonInteraction,
  StringSelectMenuInteraction,
  InteractionUpdateOptions,
  InteractionResponse,
  UserSelectMenuInteraction,
  RoleSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  ChannelType,
  TextInputStyle
} from 'discord.js';

const UserBrand: unique symbol = Symbol();
type User = string & { [UserBrand]: never };

const ChannelBrand: unique symbol = Symbol();
type Channel = string & { [ChannelBrand]: never };

type UserMentionable = { id: User; type: 'user' };
type RoleMentionable = { id: Role; type: 'role' };
type Mentionable = UserMentionable | RoleMentionable;

const RoleBrand: unique symbol = Symbol();
type Role = string & { [RoleBrand]: never };

type StringStateInput = {
  id: string;
  type: 'String';
  label: string;
  placeholder?: string;
  value?: string;
  style?: TextInputStyle;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
};

type IOption<T> = {
  result: T;
  label?: string;
  value?: string;
  description?: string;
};
type OptionStateInput<T = any> = {
  id: string;
  type: 'Option';
  options: IOption<T>[];
  placeholder?: string;
  value?: T[];
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
};

type DiscordCoreSelectInput<TVal> = {
  id: string;
  value?: TVal[];
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
};
type UserStateInput = DiscordCoreSelectInput<User> & {
  type: 'User';
};
type RoleStateInput = DiscordCoreSelectInput<Role> & {
  type: 'Role';
};
type MentionableStateInput = DiscordCoreSelectInput<Mentionable> & {
  type: 'Mentionable';
};
type ChannelStateInput = DiscordCoreSelectInput<Channel> & {
  type: 'Channel';
  channelTypes?: ChannelType[];
};

type BooleanStateInput = {
  id: string;
  type: 'Boolean';
  value?: boolean;
  trueStyle?: {
    style?: ButtonStyle;
    text?: string;
  };
  falseStyle?: {
    style?: ButtonStyle;
    text?: string;
  };
};
type MCStateInput =
  | OptionStateInput
  | BooleanStateInput
  | UserStateInput
  | RoleStateInput
  | ChannelStateInput
  | MentionableStateInput;
type ModalStateInput = StringStateInput;
type MCStateDefinition<T> = {
  inputs: MCStateInput[];
  validator: (s: T) => boolean;
};
type ModalStateDefinition<T> = {
  inputs: ModalStateInput[];
};
type MCStateValueMap = Record<string, MCStateInput['value']>;

type MCInteractionOfValue<T extends MCStateInput['value']> = T extends boolean
  ? ButtonInteraction
  : T extends IOption<any>[]
  ? StringSelectMenuInteraction
  : T extends User[]
  ? UserSelectMenuInteraction
  : T extends Role[]
  ? RoleSelectMenuInteraction
  : T extends Channel[]
  ? ChannelSelectMenuInteraction
  : T extends Mentionable[]
  ? MentionableSelectMenuInteraction
  : never;
type MCInteractionOfInput<T extends MCStateInput> = MCInteractionOfValue<
  T['value']
>;

type UpdateParam = InteractionUpdateOptions;
type Updater = (p: UpdateParam) => Promise<InteractionResponse>;
type InputUpdatedHandler<T extends MCStateInput> = (
  args: InputUpdateArgs<T>
) => Promise<void>;
type InputUpdateArgs<T extends MCStateInput> = {
  item: MCStateInput;
  oldValue: T['value'];
  newValue: T['value'];
  interaction: MCInteractionOfInput<T>;
};
type ValidationStateChangedArgs = {
  isValid: boolean;
};

export type {
  MCStateDefinition,
  ModalStateDefinition,
  MCStateInput,
  ModalStateInput,
  MCStateValueMap,
  MCInteractionOfValue,
  MCInteractionOfInput,
  StringStateInput,
  BooleanStateInput,
  OptionStateInput,
  DiscordCoreSelectInput,
  User,
  UserStateInput,
  Role,
  RoleStateInput,
  Channel,
  ChannelStateInput,
  Mentionable,
  MentionableStateInput,
  IOption,
  UpdateParam,
  Updater,
  InputUpdateArgs,
  InputUpdatedHandler,
  ValidationStateChangedArgs
};
