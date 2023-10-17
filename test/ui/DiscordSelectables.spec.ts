import { createChannelSelect, createMentionableSelect, createRoleSelect, createUserSelect } from '../../src/ui/DiscordSelectables';
import { RoleStateInput, User, UserStateInput } from '../../src/Shared';
import { ChannelType, ComponentType } from 'discord.js';
import { cMatches } from './Utils';


describe('DiscordSelectables', () => {

    test('createUserSelect creates a UserSelect component', () => {
        const optionWithDefaults = createUserSelect({ type: 'User', id: 'friend'}).toJSON();
        cMatches({
            custom_id: 'friend',
            type: ComponentType.UserSelect
        }, optionWithDefaults);
    });

    test('createRoleSelect creates a RoleSelect component', () => {
        const optionWithDefaults = createRoleSelect({ type: 'Role', id: 'perm_role'}).toJSON();
        cMatches({
            custom_id: 'perm_role',
            type: ComponentType.RoleSelect
        }, optionWithDefaults);
    });

    test('createMentionableSelect creates a MentionableSelect component', () => {
        const optionWithDefaults = createMentionableSelect({ type: 'Mentionable', id: 'who'}).toJSON();
        cMatches({
            custom_id: 'who',
            type: ComponentType.MentionableSelect
        }, optionWithDefaults);
    });

    test('createChannelSelect creates a ChannelSelect component with defaults', () => {
        const optionWithDefaults = createChannelSelect({ type: 'Channel', id: 'where'}).toJSON();
        cMatches({
            custom_id: 'where',
            type: ComponentType.ChannelSelect
        }, optionWithDefaults);
    });

    test('createChannelSelect creates a ChannelSelect component with channelTypes', () => {
        const optionWithDefaults = createChannelSelect({
            type: 'Channel',
            id: 'where',
            channelTypes: [ ChannelType.GuildVoice]
        }).toJSON();
        expect(optionWithDefaults.channel_types).toStrictEqual([ ChannelType.GuildVoice]);
    });

    test('creates correct select with optional properties', () => {
        const optionWithDefaults = createUserSelect({
            id: 'friend',
            type: 'User',
            minValues: 4,
            maxValues: 8,
            disabled: true,
            placeholder: 'Choose a friend',
            value: ['123' as User, '456' as User]
        }).toJSON();
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