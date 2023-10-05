import type {
  StateDefinition,
  EmceeUserInterface,
  IOption,
  StateValueMap
} from './Shared';
import { EmceeManager } from './EmceeManager';
import * as sb from './StateBuilder';
import { ChatInputCommandInteraction } from 'discord.js';

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
async function prompt<T extends sb.MCSchema<sb.MCRawShape>>(
  schema: T,
  uiOptions: EmceeUserInterface,
  validator: (s: sb.Infer<T>) => boolean,
  interaction: ChatInputCommandInteraction
): Promise<sb.Infer<T>> {
  using mc = new EmceeManager(schema, uiOptions, validator);
  const results = await mc.prompt(interaction);
  return results;
}

export { prompt, sb };
export type { StateDefinition, EmceeUserInterface, IOption, StateValueMap };
