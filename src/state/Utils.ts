import type { MCStateInput } from '../Shared';
import type { MCComponentTypeOf } from './Common';
import { ComponentType } from 'discord.js';

const toComponentType = <T extends MCStateInput>(
  t: MCStateInput['type']
): MCComponentTypeOf<T> => {
  switch (t) {
    case 'Boolean':
      return ComponentType.Button as unknown as MCComponentTypeOf<T>;
    case 'Option':
      return ComponentType.StringSelect as unknown as MCComponentTypeOf<T>;
    case 'User':
      return ComponentType.UserSelect as unknown as MCComponentTypeOf<T>;
    case 'Channel':
      return ComponentType.ChannelSelect as unknown as MCComponentTypeOf<T>;
    case 'Role':
      return ComponentType.RoleSelect as unknown as MCComponentTypeOf<T>;
    case 'Mentionable':
      return ComponentType.MentionableSelect as unknown as MCComponentTypeOf<T>;
  }
};

export { toComponentType };
