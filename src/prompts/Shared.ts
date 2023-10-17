import { ButtonStyle } from 'discord.js';

type InlineMessagePromptOptions = {
  title: string;
  submit?: {
    buttonText?: string;
    buttonStyle?: ButtonStyle;
  };
};

export type { InlineMessagePromptOptions };
