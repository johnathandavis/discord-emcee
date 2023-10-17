import {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { InlineMessagePromptOptions } from '../../src/prompts/Shared';

type SubmitConfig = Exclude<InlineMessagePromptOptions['submit'], undefined>;

const createSubmit = (
  config: SubmitConfig | undefined,
  enabled: boolean
): ButtonBuilder => {
  if (!config) {
    config = {};
  }
  return new ButtonBuilder()
    .setLabel(config.buttonText ?? 'Submit')
    .setCustomId('submit')
    .setDisabled(!enabled)
    .setStyle(config.buttonStyle ?? ButtonStyle.Primary);
};

export { createSubmit };
