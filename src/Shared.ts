import {
  ButtonStyle,
  ButtonInteraction,
  StringSelectMenuInteraction,
  InteractionUpdateOptions,
  InteractionResponse,
  UserSelectMenuInteraction
} from 'discord.js';

const UserBrand: unique symbol = Symbol();
type User = string & { [UserBrand]: never };

type IOption<T> = {
  result: T;
  label?: string;
  value?: string;
  description?: string;
};
type OptionStateInput<T = any> = {
  id: string;
  type: 'Option';
  placeholder?: string;
  values: IOption<T>[];
  value?: T | null;
  disabled?: boolean;
};

type UserStateInput = {
  id: string;
  type: 'User';
  value?: User[];
  disabled?: boolean;
  minValues?: number;
  maxValues?: number;
  placeholder?: string;
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
type StateInput = OptionStateInput | BooleanStateInput | UserStateInput;
type StateValue = StateInput['value'];
type StateDefinition = {
  inputs: StateInput[];
};
type StateValueMap = Record<string, StateValue>;

type InteractionOfValue<T extends StateValue> = T extends IOption<any>
  ? StringSelectMenuInteraction
  : T extends User
  ? UserSelectMenuInteraction
  : ButtonInteraction;

type InteractionOfInput<T extends StateInput> = InteractionOfValue<T>;

type UpdateParam = InteractionUpdateOptions;
type Updater = (p: UpdateParam) => Promise<InteractionResponse>;
type InputUpdatedHandler<T extends StateInput> = (
  args: InputUpdateArgs
) => Promise<void>;
type InputUpdateArgs = {
  item: StateInput;
  oldValue: StateValue;
  newValue: StateValue;
  interaction: ButtonInteraction | StringSelectMenuInteraction;
};
type ValidationStateChangedArgs = {
  isValid: boolean;
};

interface EmceeUserInterface {
  title: string;
  submit?: {
    buttonText?: string;
    buttonStyle?: ButtonStyle;
  };
}

export type {
  EmceeUserInterface,
  StateDefinition,
  StateInput,
  StateValue,
  StateValueMap,
  InteractionOfValue,
  InteractionOfInput,
  BooleanStateInput,
  OptionStateInput,
  UserStateInput,
  User,
  IOption,
  UpdateParam,
  Updater,
  InputUpdateArgs,
  InputUpdatedHandler,
  ValidationStateChangedArgs
};
