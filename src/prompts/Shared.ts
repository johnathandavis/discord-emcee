import { ButtonStyle } from 'discord.js';

type InlineMessagePromptOptions = {
  title: string;
  submit?: {
    buttonText?: string;
    buttonStyle?: ButtonStyle;
    submittedText?: string;
  };
  timeout?: {
    durationSeconds?: number;
    timeoutText?: string;
  };
};

type ModalPromptOptions = {
  title: string;
  /**
   * @default 60
   */
  timeoutSeconds?: number;
};

export type { InlineMessagePromptOptions, ModalPromptOptions };
