import { createString as _createString } from '../../src/ui/String';
import { BooleanStateInput, StringStateInput } from '../../src/Shared';
import {
  ButtonStyle,
  ComponentType,
  APITextInputComponent,
  TextInputStyle
} from 'discord.js';
import { cMatches } from './Utils';

const createString = (strState: StringStateInput): APITextInputComponent => {
  const b = _createString(strState);
  return b.toJSON() as APITextInputComponent;
};

let defaultStr: StringStateInput = {
  id: 'name',
  type: 'String',
  label: 'Enter Name:'
};

describe('createString', () => {
  test('fills in optional properties', () => {
    cMatches(
      {
        custom_id: 'name',
        label: 'Enter Name:',
        style: TextInputStyle.Short,
        type: ComponentType.TextInput,
        required: true
      },
      createString(defaultStr)
    );
  });

  test('uses style and placeholder if provided', () => {
    let paragraphStr: StringStateInput = {
      ...defaultStr,
      style: TextInputStyle.Paragraph,
      placeholder: 'Type here'
    };

    cMatches(
      {
        style: TextInputStyle.Paragraph,
        placeholder: 'Type here'
      },
      createString(paragraphStr)
    );
  });

  test('uses constraints if provided', () => {
    let constrainedStr: StringStateInput = {
      ...defaultStr,
      minLength: 10,
      maxLength: 100
    };

    cMatches(
      {
        min_length: 10,
        max_length: 100
      },
      createString(constrainedStr)
    );
  });

  test('makes required if provided', () => {
    let constrainedStr: StringStateInput = {
      ...defaultStr,
      required: false
    };

    cMatches(
      {
        required: false
      },
      createString(constrainedStr)
    );
  });
});
