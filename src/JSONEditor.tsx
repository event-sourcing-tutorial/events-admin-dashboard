import './App.css';
import {FormControl, FormHelperText, Input, InputBaseComponentProps, InputLabel} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import React from 'react';

const Editor = React.forwardRef((props: InputBaseComponentProps, _ref: any) => {
  return <CodeMirror
    className={props.className}
    onFocus={props.onFocus as any}
    onBlur={props.onBlur as any}
    value={props.value}
    extensions={[json()]}
    theme="dark"
    editable={true}
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
  text: string,
  error: string | undefined,
  onChange: (text: string) => void,
};

export function JSONEditor(props: JSONEditorProps) {
  return <>
    <FormControl>
        <InputLabel htmlFor="my-input" shrink variant="standard">Event Data</InputLabel>
        <Input id="my-input" aria-describedby="event data" 
          multiline
          inputComponent={Editor}
          value={props.text}
          onChange={e => {
            props.onChange(e.target.value);
          }}
        />
        {
          props.error === undefined
            ? null 
            : <FormHelperText id="my-helper-text" variant="standard" error>
                {props.error}
              </FormHelperText>
        }
    </FormControl>
  </>;
}

