import {
  APIButtonComponent,
  APIStringSelectComponent,
  APISelectMenuOption,
  APIUserSelectComponent,
  APIChannelSelectComponent,
  APIRoleSelectComponent,
  APIMentionableSelectComponent,
  APITextInputComponent
} from 'discord.js';

type C =
  | APIButtonComponent
  | APIStringSelectComponent
  | APISelectMenuOption
  | APIUserSelectComponent
  | APIChannelSelectComponent
  | APIRoleSelectComponent
  | APIMentionableSelectComponent
  | APITextInputComponent;
function cMatches<T extends C>(expected: Partial<C>, actual: C): boolean {
  let e = expected as Record<string, any>;
  const a = actual as Record<string, any>;
  const failures = Object.keys(expected).filter((k) => {
    let eVal = e[k];
    let aVal = a[k];
    if (eVal != aVal) {
      return true;
    }
    return false;
  });
  if (failures.length > 0) {
    throw new Error(`These properties differed:\n${failures.join(',')}`);
  }
  return true;
}

export { cMatches };
