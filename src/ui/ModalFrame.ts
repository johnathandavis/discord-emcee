import {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  TextInputBuilder
} from 'discord.js';
import {
  OptionStateInput,
  BooleanStateInput,
  UserStateInput,
  ChannelStateInput,
  RoleStateInput,
  MentionableStateInput,
  StringStateInput,
  ModalStateInput
} from '../Shared';
import { InlineMessagePromptOptions } from '../prompts/Shared';
import { ExtendedBuilder } from './DiscordSelectables';
import { Infer, ModalSchema } from '../schema/SchemaBuilder';
import { ModalRawShape } from 'schema/Core';
import { createString } from './String';
import { defaultMCInstanceFactory } from './MCFrame';
import type { Component as MCComponent } from './MCFrame';

type ModalComponent = MCComponent | TextInputBuilder;
type ModalRow<T extends ModalComponent> = ActionRowBuilder<T>;
type ModalComponents = ModalRow<any>[];

type ModalComponentBuildFor<T extends ModalStateInput> =
  T extends OptionStateInput
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
    : T extends StringStateInput
    ? TextInputBuilder
    : never;

type ModalInputFactory = {
  [IT in ModalStateInput as IT['type']]: (
    i: IT,
    v: IT['value']
  ) => ModalComponentBuildFor<IT>;
};

function modalRow<T extends ModalComponent>(c: T): ModalRow<T> {
  return new ActionRowBuilder<T>().addComponents(c);
}

const defaultModalInstanceFactory: ModalInputFactory = {
  ...defaultMCInstanceFactory,
  String: (b: StringStateInput, currentValue: string | undefined) => {
    return createString(b, currentValue!);
  }
};

function createModalUI<
  TShape extends ModalRawShape = ModalRawShape,
  T extends ModalSchema<TShape> = ModalSchema<TShape>
>(
  uiDef: InlineMessagePromptOptions,
  schema: T,
  currentState: Infer<T>,
  validator: (s: Infer<T>) => boolean,
  inputFactory?: ModalInputFactory
): ModalComponents {
  const iff = inputFactory ?? defaultModalInstanceFactory;
  const sd = schema.toStateDefinition();

  const validated = validator(currentState);
  const rows: ModalComponents = [];

  sd.inputs.forEach((i) => {
    const iffFunc = iff[i.type] as (
      i: ModalStateInput,
      v: any | undefined
    ) => ModalComponent;
    rows.push(modalRow(iffFunc(i, currentState[i.id])));
  });
  return rows;
}

export { createModalUI };
export type { ModalInputFactory, ModalComponent, ModalRow };
