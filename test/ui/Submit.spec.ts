import { createSubmit as _createSubmit } from '../../src/ui/Submit';
import { InlineMessagePromptOptions } from '../../src/prompts';
import { ButtonStyle, ComponentType, APIButtonComponent } from 'discord.js';
import { cMatches } from './Utils';

type SubmitConfig = Exclude<InlineMessagePromptOptions['submit'], undefined>
const createSubmit = (config: SubmitConfig | undefined, enabled: boolean): APIButtonComponent => {
    const btn = _createSubmit(config, enabled);
    return btn.toJSON() as APIButtonComponent;
}

describe('createSubmit', () => {

    test('creates correct default submit button when no config provided', () => {

        const undefinedSubmitConfig: SubmitConfig | undefined = undefined;
        cMatches({
            custom_id: 'submit',
            label: 'Submit',
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
            disabled: false
        }, createSubmit(undefinedSubmitConfig, true));
        cMatches({
            custom_id: 'submit',
            label: 'Submit',
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
            disabled: true
        }, createSubmit(undefinedSubmitConfig, false));
    })
    
    test('creates correct default submit button when empty config provided and toggles disabled', () => {

        const defaultSubmitConfig: SubmitConfig = {};
        cMatches({
            custom_id: 'submit',
            label: 'Submit',
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
            disabled: false
        }, createSubmit(defaultSubmitConfig, true));
        cMatches({
            custom_id: 'submit',
            label: 'Submit',
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
            disabled: true
        }, createSubmit(defaultSubmitConfig, false));

    });

    test('uses custom config settings when present', () => {

        const customSubmitConfig: SubmitConfig = {
            buttonText: 'Go',
            buttonStyle: ButtonStyle.Danger
        };
        cMatches({
            custom_id: 'submit',
            label: 'Go',
            style: ButtonStyle.Danger,
            type: ComponentType.Button,
            disabled: false
        }, createSubmit(customSubmitConfig, true));
    });
});