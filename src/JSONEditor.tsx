import './App.css';
import {FormControl, FormHelperText, Input, InputBaseComponentProps, InputLabel} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import React from 'react';

export const JSONViewer = (props: {text: string}) => {
  return <CodeMirror
    value={props.text}
    extensions={[json()]}
    theme="dark"
    editable={false}
    basicSetup={{
      lineNumbers: false,
    }}
  />;
}

const Editor = React.forwardRef((props: InputBaseComponentProps, _ref: any) => {
  const {disabled} = props;
  return <CodeMirror
    className={props.className}
    onFocus={props.onFocus as any}
    onBlur={props.onBlur as any}
    value={props.value}
    extensions={[json()]}
    theme="dark"
    editable={!disabled}
    basicSetup={{
      lineNumbers: true,
    }}
    onChange={(value) => {
      const e = {
        target: {
          value
        },
      };
      if (props.onChange) {
        props.onChange(e as any);
      }
    }}
  />;
})



type JSONEditorProps = {
  id: string,
  text: string,
  label: String,
  error: string | undefined,
  disabled?: boolean,
  onChange: (text: string) => void,
};

export function JSONEditor(props: JSONEditorProps) {
  const {error, disabled, id, label} = props;
  return <>
    <FormControl>
        <InputLabel htmlFor={id} shrink variant="standard" required error={error !== undefined}>{label}</InputLabel>
        <Input id={id} aria-describedby="event data" 
          multiline
          inputComponent={Editor}
          value={props.text}
          disabled={disabled}
          onChange={e => {
            props.onChange(e.target.value);
          }}
        />
        {
          props.error === undefined
            ? null 
            : <FormHelperText variant="standard" error>
                {props.error}
              </FormHelperText>
        }
    </FormControl>
  </>;
}

