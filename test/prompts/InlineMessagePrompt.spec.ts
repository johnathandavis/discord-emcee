import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  InteractionReplyOptions,
  UserSelectMenuBuilder,
  UserSelectMenuInteraction
} from 'discord.js';
import { sb } from '../../src';
import promptInline from '../../src/prompts/InlineMessagePrompter';
import { InlineMessagePromptOptions, TimeOutError } from '../../src/prompts';
import { FakeInteraction } from './FakeInteraction';
import { FakeCollector } from './FakeCollector';
import { FakeResponse } from './FakeResponse';
import { createFakeAttachers } from './FakeAttachers';
import type { FakeAttachers } from './FakeAttachers';
import { MCRawShape, MCSchema } from '../../src/schema';
import { State } from '../../src/state';

const s = sb.createMCSchema({
  user: sb.userInput({})
});
type SType = sb.Infer<typeof s>;
const options: InlineMessagePromptOptions = {
  title: 'Select person'
};

describe('InlinePrompt', () => {
  let fi: FakeInteraction;
  let response: FakeResponse;
  let collector: FakeCollector;
  let attachers: FakeAttachers;

  beforeEach(() => {
    collector = new FakeCollector();
    response = new FakeResponse(collector);
    fi = new FakeInteraction(response);
    attachers = createFakeAttachers();
    MCSchema.setCustomStateFactory(
      s,
      (sd) => new State<MCRawShape>(sd, attachers)
    );
  });

  test('Respects timeout', async () => {
    let result: SType | undefined = undefined;
    let error: Error | undefined = undefined;
    try {
      result = await promptInline(
        s,
        { ...options, timeout: { durationSeconds: 1 } },
        fi as unknown as ChatInputCommandInteraction
      );
    } catch (err) {
      error = err as Error;
    }
    expect(result).toBeUndefined();
    expect(error).toBeInstanceOf(TimeOutError);
    expect(error!.name).toBe(TimeOutError.Name);
    expect(error!.message).toBe(`No valid response received before 1s.`);
  });

  test('Calls reply with UI', async () => {
    const resultPromise = promptInline(
      s,
      { ...options },
      fi as unknown as ChatInputCommandInteraction
    );
    const triggerCollector = await collector.waitForAttachAsync();
    const replyPayload = fi.replyMessagePayload;
    expect(replyPayload).toBeDefined();
    expect(replyPayload?.content).toBe('Select person');

    const row1 = replyPayload!.components!.at(
      0
    ) as ActionRowBuilder<UserSelectMenuBuilder>;
    const userSelect = row1.components[0].data;
    const row2 = replyPayload!.components!.at(
      1
    ) as ActionRowBuilder<ButtonBuilder>;
    const submitBtn = row2.components[0].data;
    expect(row1).toBeDefined();
    expect(userSelect.type).toBe(ComponentType.UserSelect);
    expect(row2).toBeDefined();
    expect(submitBtn.type).toBe(ComponentType.Button);
  });

  test('Attaches to state update events to complete prompt', async () => {
    const resultPromise = promptInline(
      s,
      { ...options },
      fi as unknown as ChatInputCommandInteraction
    );
    const triggerCollector = await collector.waitForAttachAsync();
    let updatedUi: InteractionReplyOptions | undefined = undefined;
    await triggerCollector({
      values: ['123'],
      componentType: ComponentType.UserSelect,
      update: async (ui: InteractionReplyOptions) => {
        updatedUi = ui;
      }
    } as unknown as UserSelectMenuInteraction);

    const row1 = updatedUi!.components!.at(
      0
    ) as ActionRowBuilder<UserSelectMenuBuilder>;
    const userSelect = row1.components[0].toJSON() as {
      default_values?: string[];
    };
    expect(userSelect!.default_values![0]).toStrictEqual({
      type: 'user',
      id: '123'
    });
  });
});
