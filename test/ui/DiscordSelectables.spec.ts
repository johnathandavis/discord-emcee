import { createUserSelect } from '../../src/ui/DiscordSelectables';
import { User, UserStateInput } from '../../src/Shared';
import { ComponentType } from 'discord.js';
import { cMatches } from './Utils';

const MinimalUserState: UserStateInput = {
    id: 'friend',
    type: 'User'
};
const UserStateWithOptionals: UserStateInput = {
    ...MinimalUserState,
    value: ['123' as User, '456' as User],
    minValues: 4,
    maxValues: 8,
    placeholder: 'Choose a friend',
    disabled: true
}

describe('DiscordSelectables', () => {

    test('createUserSelect creates a UserSelect component', () => {
        const optionWithDefaults = createUserSelect(MinimalUserState).toJSON();
        cMatches({
            custom_id: 'friend',
            type: ComponentType.UserSelect
        }, optionWithDefaults);
    });

    test('creates correct select with optional properties', () => {
        const optionWithDefaults = createUserSelect(UserStateWithOptionals).toJSON();
        cMatches({
            min_values: 4,
            max_values: 8,
            placeholder: 'Choose a friend',
            disabled: true
        }, optionWithDefaults);
        expect(optionWithDefaults.default_values![0]).toStrictEqual({ id: '123', type: 'user'});
        expect(optionWithDefaults.default_values![1]).toStrictEqual({ id: '456', type: 'user'});
    });
});