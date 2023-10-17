import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from 'discord.js';
import {
  StringStateInput,
  ModalStateInput,
  ModalStateDefinition
} from '../Shared';
import {
  InlineMessagePromptOptions,
  ModalPromptOptions
} from '../prompts/Shared';
import { ModalSchema } from '../schema/SchemaBuilder';
import { createString } from './String';

type ModalComponent = TextInputBuilder;
type ModalRow<T extends ModalComponent> = ActionRowBuilder<T>;
type ModalComponents = ModalRow<any>[];

type ModalComponentBuildFor<T extends ModalStateInput> =
  T extends StringStateInput ? TextInputBuilder : never;

type ModalInputFactory = {
  [IT in ModalStateInput as IT['type']]: (i: IT) => ModalComponentBuildFor<IT>;
};

function modalRow<T extends ModalComponent>(c: T): ModalRow<T> {
  return new ActionRowBuilder<T>().addComponents(c);
}

const defaultModalInstanceFactory: ModalInputFactory = {
  String: (b: StringStateInput) => {
    return createString(b);
  }
};

type PromptOptionsWithCustomId = ModalPromptOptions & {
  customId: string;
};
function createModalUI<T extends ModalSchema<any>>(
  uiDef: PromptOptionsWithCustomId,
  schema: T,
  inputFactory?: ModalInputFactory
): ModalBuilder {
  const iff = inputFactory ?? defaultModalInstanceFactory;
  const sd = schema.toStateDefinition() as ModalStateDefinition<any>;
  const rows: ModalComponents = [];

  sd.inputs.forEach((i) => {
    const iffFunc = iff[i.type] as (
      i: ModalStateInput,
      v: any | undefined
    ) => ModalComponent;
    rows.push(modalRow(iffFunc(i, undefined)));
  });
  const builder = new ModalBuilder();
  builder.setComponents(rows);
  builder.setTitle(uiDef.title);
  builder.setCustomId(uiDef.customId);
  return builder;
}

export { createModalUI };
export type { ModalInputFactory, ModalComponent, ModalRow };
