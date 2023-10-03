import { ButtonStyle, ButtonInteraction, StringSelectMenuInteraction,
    InteractionUpdateOptions, InteractionResponse } from "discord.js";

type IOption<T> = {
    label: string,
    value: string,
    result: T,
    description?: string,
}
type OptionStateInput<T=any> = {
    id: string,
    type: 'Option',
    placeholder?: string,
    values: IOption<T>[],
    value?: T | null
}
type BooleanStateInput = {
    id: string,
    type: 'Boolean',
    value?: boolean,
    trueStyle?: {
        style?: ButtonStyle,
        text?: string
    },
    falseStyle?: {

    }
}
type StateInput = OptionStateInput | BooleanStateInput
type StateValue = StateInput['value'];
type StateDefinition = {
    inputs: StateInput[],
}
type StateValueMap = Record<string, StateValue>;

type InteractionOfValue<T extends StateValue> =
      T extends IOption<any>    ? StringSelectMenuInteraction
    : ButtonInteraction;

type InteractionOfInput<T extends StateInput> =
    T['value'] extends IOption<any>
        ? StringSelectMenuInteraction
        : ButtonInteraction;

type UpdateParam = InteractionUpdateOptions;
type Updater = (p: UpdateParam) => Promise<InteractionResponse>;
type InputUpdatedHandler<T extends StateInput> = (args: InputUpdateArgs) => Promise<void>;
type InputUpdateArgs = {
    item: StateInput,
    oldValue: StateValue,
    newValue: StateValue,
    interaction: ButtonInteraction | StringSelectMenuInteraction
}
type ValidationStateChangedArgs = {
    isValid: boolean
}

interface EmceeUserInterface {
    title: string,
    submit?: {
        buttonText?: string,
        buttonStyle?: ButtonStyle,
    }
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
    IOption,
    UpdateParam,
    Updater,
    InputUpdateArgs,
    InputUpdatedHandler,
    ValidationStateChangedArgs
}