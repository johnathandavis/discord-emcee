import {
  ChatInputCommandInteraction,
  ModalSubmitInteraction
} from 'discord.js';
import * as sb from '../schema/SchemaBuilder';
import type { ModalPromptOptions } from './Shared';
import { createModalUI } from '../ui';
import { ObjectOutput } from '../schema/Core';
import { v4 } from 'uuid';

/**
 * Prompt a Discord user information via a MessageComponent.
 * @param schema the schema for the data you're trying
 * to get from the user
 * @param uiOptions rendering options
 * @param validator a function to determine if the
 * partial state is ready for submission
 * (i.e. whether or not to enable the Submit button)
 * @param interaction the Discord interaction object
 * @returns a value staisfying the schema (as a Promise)
 */
async function promptModal<
  TShape extends sb.ModalRawShape = sb.ModalRawShape,
  Output extends ObjectOutput<TShape> = ObjectOutput<TShape>
>(
  schema: sb.ModalSchema<TShape>,
  uiOptions: ModalPromptOptions,
  interaction: ChatInputCommandInteraction
): Promise<Output> {
  const stateDef = schema.toStateDefinition();
  const customId = v4();
  const optionsWithId = {
    ...uiOptions,
    customId: customId
  };
  const ui = createModalUI(optionsWithId, schema);
  await interaction.showModal(ui);
  const timeoutMs = uiOptions.timeoutSeconds
    ? uiOptions.timeoutSeconds! * 1000
    : 60_000;
  const modalInteraction = await interaction.awaitModalSubmit({
    filter: (interaction: ModalSubmitInteraction) =>
      interaction.customId === customId,
    time: timeoutMs
  });

  const output: { [k: string]: any } = {};
  for (let input of stateDef.inputs) {
    const id = input.id;
    output[id] = modalInteraction.fields.getTextInputValue(id);
  }

  return output as Output;
}

export default promptModal;
