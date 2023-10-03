import type {
  StateDefinition,
  EmceeUserInterface,
  IOption,
  StateValueMap
} from './Shared';
import { EmceeManager } from './EmceeManager';
import * as sb from './StateBuilder';
import { ChatInputCommandInteraction } from 'discord.js';

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
