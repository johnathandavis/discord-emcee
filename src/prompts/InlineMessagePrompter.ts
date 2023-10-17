import { ChatInputCommandInteraction, ComponentType } from 'discord.js';
import * as sb from '../schema/SchemaBuilder';
import type {
  MCStateInput,
  MCInteractionOfInput,
  InputUpdateArgs,
  MCStateDefinition
} from '../Shared';
import type { InlineMessagePromptOptions } from './Shared';
import { TimeOutError } from './Shared';
import { State } from '../state';
import { createComponentUI } from '../ui';
import { ObjectOutput } from '../schema/Core';

const DefaultTimeoutSeconds = 60;
type InteractionTypes = MCInteractionOfInput<MCStateInput>;
type CustomStateFactory<TShape extends sb.MCRawShape = sb.MCRawShape> = (
  sd: MCStateDefinition<sb.MCRawShape>
) => State<TShape>;

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
  let state = stateDefinition.createState();
  const promptResponse = await interaction.reply(
    createComponentUI(
      uiOptions,
      schema,
      state.valueMap as Output,
      stateDefinition.validator,
      'Open'
    )
  );

  const stateUpdated = async <TState extends MCStateInput>(
    args: InputUpdateArgs<TState>
  ) => {
    console.debug('Emcee received state item update:');
    console.debug(args.item);
    console.debug(`From: '${args.oldValue}' to '${args.newValue}'`);
    mcInteraction = args.interaction;
    await args.interaction.update(
      createComponentUI(
        uiOptions,
        schema,
        state.valueMap as Output,
        stateDefinition.validator,
        'Open'
      )
    );
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
  const completeInteraction = async (i: InteractionTypes) => {
    await i.update(
      createComponentUI(
        uiOptions,
        schema,
        state.valueMap as Output,
        stateDefinition.validator,
        'Completed'
      )
    );
  };
  const timeoutInteraction = async (i: InteractionTypes) => {
    await i.update(
      createComponentUI(
        uiOptions,
        schema,
        state.valueMap as Output,
        stateDefinition.validator,
        'TimedOut'
      )
    );
  };
  const timeoutSec =
    uiOptions.timeout?.durationSeconds ?? DefaultTimeoutSeconds;
  const timeoutMs = timeoutSec * 1000;
  return new Promise<Output>((resolve, reject) => {
    const abort = () => {
      cleanup();
      let timeoutErr = new TimeOutError(
        `No valid response received before ${timeoutSec}s.`
      );
      if (mcInteraction) {
        timeoutInteraction(mcInteraction)
          .then(() => reject('Timed out!'))
          .catch((err) => reject(timeoutErr));
      } else {
        reject(timeoutErr);
      }
    };
    const timeoutId = setTimeout(() => abort(), timeoutMs);
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
      completeInteraction(i)
        .then(() => resolve(sv as Output))
        .catch((err) => reject(err));
    });
  });
}

export default promptInline;
