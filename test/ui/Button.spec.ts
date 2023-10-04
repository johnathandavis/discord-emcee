import { createButton as _createButton } from '../../src/ui/Button';
import { BooleanStateInput } from '../../src/Shared';
import { ButtonStyle, ComponentType, APIButtonComponent } from 'discord.js';
import { cMatches } from './Utils';

const createButton = (btnState: BooleanStateInput, value: boolean): APIButtonComponent => {
    const btn = _createButton(btnState, value);
    return btn.toJSON() as APIButtonComponent;
}

describe('createButton', () => {

    test('fills in optional properties and toggles label based on value', () => {
        
        let defaultBs: BooleanStateInput = {
            id: 'toggle',
            type: 'Boolean'
        }

        cMatches({
            custom_id: 'toggle',
            label: 'True',
            style: ButtonStyle.Primary,
            type: ComponentType.Button
        }, createButton(defaultBs, true));
        cMatches({
            custom_id: 'toggle',
            label: 'False',
            style: ButtonStyle.Danger,
            type: ComponentType.Button
        }, createButton(defaultBs, false));

    });

    test('uses styles if provided', () => {
        let btnWithStyle: BooleanStateInput = {
            id: 'stylish',
            type: 'Boolean',
            trueStyle: {
                text: 'On',
                style: ButtonStyle.Success
            },
            falseStyle: {
                text: 'Off',
                style: ButtonStyle.Secondary
            }
        }
        cMatches({
            custom_id: 'stylish',
            label: 'On',
            style: ButtonStyle.Success,
            type: ComponentType.Button
        }, createButton(btnWithStyle, true));
        cMatches({
            custom_id: 'stylish',
            label: 'Off',
            style: ButtonStyle.Secondary,
            type: ComponentType.Button
        }, createButton(btnWithStyle, false));
    });

});