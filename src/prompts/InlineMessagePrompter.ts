import {
  ChatInputCommandInteraction,
  ComponentType,
  InteractionResponse
} from 'discord.js';
import * as sb from '../schema/SchemaBuilder';
import type {
  MCStateInput,
  MCInteractionOfInput,
  InputUpdateArgs
} from '../Shared';
import type { InlineMessagePromptOptions } from './Shared';
import { State } from '../state';
import { createComponentUI } from '../ui';
import { ObjectOutput } from '../schema/Core';

type InteractionTypes = MCInteractionOfInput<MCStateInput>;

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
async function promptInline<
  TShape extends sb.MCRawShape = sb.MCRawShape,
  Output extends ObjectOutput<TShape> = ObjectOutput<TShape>
>(
  schema: sb.MCSchema<TShape>,
  uiOptions: InlineMessagePromptOptions,
  interaction: ChatInputCommandInteraction
): Promise<Output> {
  let mcInteraction: InteractionTypes | undefined = undefined;
  const stateDefinition = schema.toStateDefinition();
  let state = new State<TShape>(stateDefinition);

  const promptResponse = await interaction.reply({
    ...createComponentUI(
      uiOptions,
      schema,
      state.valueMap as Output,
      stateDefinition.validator
    )
  });

  const stateUpdated = async <TState extends MCStateInput>(
    args: InputUpdateArgs<TState>
  ) => {
    console.debug('Emcee received state item update:');
    console.debug(args.item);
    console.debug(`From: '${args.oldValue}' to '${args.newValue}'`);
    mcInteraction = args.interaction;
    await args.interaction.update({
      ...createComponentUI(
        uiOptions,
        schema,
        state.valueMap as Output,
        stateDefinition.validator
      )
    });
  };

  state.on('stateUpdate', stateUpdated);
  state.on('validationStateChanged', (args) => {
    if (args.isValid) {
      console.log('We are valid!');
    }
  });
  state.monitorStateUpdates(promptResponse);
  const c = promptResponse!.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (b) => b.customId === 'submit'
  });
  return new Promise<Output>((resolve, reject) => {
    const abort = () => {
      cleanup();
      if (mcInteraction) {
        mcInteraction!
          .update({
            content: 'You took too long! Try again.'
          })
          .then(() => reject('Timed out!'))
          .catch((err) => reject(err));
      } else {
        reject('Timed out!');
      }
    };
    const timeoutId = setTimeout(() => abort(), 1000 * 60);
    const cleanup = () => {
      try {
        c.dispose(interaction!);
      } catch (err) {
        console.warn(`Failed to dispose submit collector...`);
        console.warn(err);
      }
      clearTimeout(timeoutId);
    };
    c.on('collect', async (i) => {
      const sv = state.valueMap;
      cleanup();
      i.update({
        content: 'Starting conversation...'
      })
        .then(() => resolve(sv as Output))
        .catch((err) => reject(err));
    });
  });
}

export default promptInline;
