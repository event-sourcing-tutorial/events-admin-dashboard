import Button from '@mui/material/Button';
import {Stack} from '@mui/system';
import {Container, IconButton, TextField, Typography} from '@mui/material';
import {parse} from "json5";
import {useState} from 'react';
import {JSONEditor} from './JSONEditor';
import {EventsApisClientImpl} from '@event-sourcing-tutorial/eventsapis-proto';
import {v4 as uuidv4} from "uuid";
import RefreshIcon from '@mui/icons-material/Refresh';

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

const initial_json = "{\n  \n}";

export const InsertCommandContainer = ({client}: {client: EventsApisClientImpl}) => {
  const [json, setjson] = useState(json_state(initial_json));
  const [command_id, set_command_id] = useState(uuidv4());
  const [command_type, set_command_type] = useState("");
  const [submitstate, setsubmitstate] = useState(initial_submit_state);
  return <Container maxWidth="sm" fixed disableGutters>
    <Typography variant="h2">
      Insert Command
    </Typography>
    <Stack direction="column" spacing={2}>
      <Stack direction="row">
        <TextField
          id="commandid"
          label="Command ID"
          type="text"
          variant='standard'
          InputLabelProps={{
            shrink: true,
          }}
          required
          error={command_id.length === 0}
          value={command_id}
          disabled={submitstate.in_progress}
          onChange={(e) => set_command_id(e.target.value)}
          fullWidth
        />
        <IconButton disabled={submitstate.in_progress} onClick={() => set_command_id(uuidv4())}>
          <RefreshIcon />
        </IconButton>
      </Stack>
      <TextField
        id="commandtype"
        label="Command Type"
        type="text"
        variant='standard'
        InputLabelProps={{
          shrink: true,
        }}
        required
        error={command_type.length === 0}
        value={command_type}
        disabled={submitstate.in_progress}
        onChange={(e) => set_command_type(e.target.value)}
      />
      <JSONEditor
        id="command_data"
        label="Command Data"
        text={json.text}
        error={json.type === "invalid" ? json.error : undefined}
        disabled={submitstate.in_progress}
        onChange={(text) => {
          setjson(json_state(text));
        }}
      />
      <Button
        variant="contained"
        disabled={json.type === "invalid" || command_id.length === 0 || command_type.length === 0 || submitstate.in_progress}
        onClick={() => {
          if (json.type === "valid" && !submitstate.in_progress) {
            setsubmitstate((state) => ({...state, in_progress: true}));
            client.IssueCommand({
              commandId: command_id,
              commandType: command_type,
              commandData: json.json,
            })
            .then(({success}) => {
              setsubmitstate((_state) => ({
                in_progress: false,
                last_error: success ? "Success" : "Error: submission failed, command id is probably wrong",
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
        Insert Command
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
