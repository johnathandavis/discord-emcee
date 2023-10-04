import {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { EmceeUserInterface } from '../Shared';

type SubmitConfig = Exclude<EmceeUserInterface['submit'], undefined>;

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
