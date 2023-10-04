import './SymPolyfill';
import {
  ChatInputCommandInteraction,
  InteractionResponse,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ComponentType
} from 'discord.js';
import type {
  EmceeUserInterface,
  InputUpdateArgs,
  StateValueMap
} from './Shared';
import { createUI } from './ui';
import { State } from './State';
import { MCSchema, MCRawShape, Infer } from './StateBuilder';

class EmceeManager<T extends MCSchema<MCRawShape>> {
  private interaction: ChatInputCommandInteraction | undefined = undefined;
  private promptResponse: InteractionResponse | undefined = undefined;
  private _latestInteraction:
    | ButtonInteraction
    | StringSelectMenuInteraction
    | undefined = undefined;
  private readonly _schema: T;
  private readonly _state: State;
  private readonly ui: EmceeUserInterface;
  private readonly _validator: (s: Infer<T>) => boolean;

  constructor(
    schema: T,
    uiOptions: EmceeUserInterface,
    validator: (s: Infer<T>) => boolean
  ) {
    this.ui = uiOptions;
    this._schema = schema;
    this._validator = validator;
    const stateDef = schema.toStateDefinition();
    this._state = new State(stateDef, validator);
  }

  prompt = async (i: ChatInputCommandInteraction): Promise<Infer<T>> => {
    if (this.interaction) {
      throw new Error('Interaction already set.');
    }
    this.interaction = i;
    this.promptResponse = await i.reply({
      ...createUI(this.ui, this._schema, this._state.valueMap, this._validator)
    });
    this._state.on('stateUpdate', this.stateUpdated);
    this._state.on('validationStateChanged', (args) => {
      if (args.isValid) {
        console.log('We are valid!');
      }
    });
    this._state.monitorStateUpdates(this.promptResponse);
    const c = this.promptResponse!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (b) => b.customId === 'submit'
    });
    return new Promise<StateValueMap>((resolve, reject) => {
      const abort = () => {
        cleanup();
        if (this._latestInteraction) {
          this._latestInteraction!.update({
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
          c.dispose(this.interaction!);
        } catch (err) {
          console.warn(`Failed to dispose submit collector...`);
          console.warn(err);
        }
        clearTimeout(timeoutId);
      };
      c.on('collect', async (i) => {
        const sv = this._state.valueMap;
        cleanup();
        i.update({
          content: 'Starting conversation...'
        })
          .then(() => resolve(sv))
          .catch((err) => reject(err));
      });
    });
  };

  private stateUpdated = async (args: InputUpdateArgs) => {
    console.debug('Emcee received state item update:');
    console.debug(args.item);
    console.debug(`From: '${args.oldValue}' to '${args.newValue}'`);
    this._latestInteraction = args.interaction;
    await args.interaction.update({
      ...createUI(this.ui, this._schema, this._state.valueMap, this._validator)
    });
  };

  [Symbol.dispose] = () => {
    try {
      this._state[Symbol.dispose]();
    } catch (err) {
      console.warn(`Error disposing of state:`);
      console.warn(err);
    }
  };
}

export { EmceeManager };
