import Button from '@mui/material/Button';
import {Stack} from '@mui/system';
import {Container, TextField, Typography} from '@mui/material';
import {parse} from "json5";
import {useState} from 'react';
import {JSONEditor} from './JSONEditor';
import {EventsApisClientImpl} from '@event-sourcing-tutorial/eventsapis-proto';

type JSONState =
  {type: "valid", text: string, json: any} |
  {type: "invalid", text: string, error: string};

const json_state: (text: string) => JSONState = (text) => {
  try {
    const json = parse(text);
    return {type: "valid", text, json};
  } catch (error: any) {
    return {type: "invalid", text, error: error.message};
  }
}

type SubmitState = {
  in_progress: boolean;
  last_error: string | undefined;
};

const initial_submit_state: SubmitState = {in_progress: false, last_error: undefined};

const initial_json = "{\n  events: [\n    {type: ---, data: {}},\n  ],\n}";

export const InsertEventContainer = ({client}: {client: EventsApisClientImpl}) => {
  const [json, setjson] = useState(json_state(initial_json));
  const [index, setindex] = useState(0);
  const [submitstate, setsubmitstate] = useState(initial_submit_state);
  return <Container maxWidth="sm" fixed disableGutters>
    <Typography variant="h2">
      Insert Event
    </Typography>
    <Stack direction="column" spacing={2}>
      <TextField
        id="eventidx"
        label="Index"
        type="number"
        variant='standard'
        InputLabelProps={{
          shrink: true,
        }}
        required
        error={index === 0}
        value={index.toString()}
        disabled={submitstate.in_progress}
        onChange={(e) => setindex(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10)))}
      />
      <JSONEditor
        id="event_editor"
        label="Payload"
        text={json.text}
        error={json.type === "invalid" ? json.error : undefined}
        disabled={submitstate.in_progress}
        onChange={(text) => {
          setjson(json_state(text));
        }}
      />
      <Button
        variant="contained"
        disabled={json.type === "invalid" || index === 0 || submitstate.in_progress}
        onClick={() => {
          if (json.type === "valid" && !submitstate.in_progress) {
            setsubmitstate((state) => ({...state, in_progress: true}));
            client.InsertEvent({
              idx: BigInt(index),
              payload: json.json,
            })
            .then(({success}) => {
              setsubmitstate((_state) => ({
                in_progress: false,
                last_error: success ? "Success" : "Error: submission failed, index is probably wrong",
              }));
            })
            .catch(error => {
              setsubmitstate((_state) => ({
                in_progress: false,
                last_error: `Error: ${error.message}`,
              }));
            });
          }
        }}
        >
        Insert Payload
      </Button>
      {
        submitstate.in_progress 
        ? <div>Submitting ...</div>
          : submitstate.last_error === undefined 
            ? null
            : <div>
                {submitstate.last_error}
              </div>
      }
    </Stack>
  </Container>;
};
