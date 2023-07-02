import './App.css';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {Stack} from '@mui/system';
import {Container, TextField, Typography} from '@mui/material';
import {parse} from "json5";
import {useState} from 'react';
import {JSONEditor} from './JSONEditor';
import { EventFetcher } from './EventFetcher';
import {EventsApisClientImpl} from '@event-sourcing-tutorial/eventsapis-proto';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: "3.5rem",
        },
        h2: {
          fontSize: "2rem",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: ["Menlo", "Ubuntu Mono", "Monaco", "monospace"].join(","),
        },
      }
    },
  },
});

function App({client}: {client: EventsApisClientImpl}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main><MyApp client={client}/></main>
    </ThemeProvider>
  );
}

type JSONState = 
  {type: "valid", text: string, json: any} |
  {type: "invalid", text: string, error: string};

const make_state: (text: string) => JSONState = (text) => {
  try {
    const json = parse(text);
    return {type: "valid", text, json};
  } catch (error: any) {
    return {type: "invalid", text, error: error.message};
  }
}

function MyApp({client}: {client: EventsApisClientImpl}) {
  const [state, setstate] = useState(make_state("{}"));
  return <Container>
    <Typography variant="h1">
      Events
    </Typography>
    <Stack direction="row" spacing={2}>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h2">
          Insert Event
        </Typography>
        <Stack direction="column" spacing={2}>
          <TextField
            id="eventidx"
            label="Event Index"
            type="number"
            variant='standard' 
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <JSONEditor
            text={state.text}
            error={state.type === "invalid" ? state.error : undefined}
            onChange={(text) => {
              console.log(text);
              setstate(make_state(text));
            }}
          />
          <Button 
            variant="contained"
            disabled={state.type === "invalid"}
            onClick={() => setstate(make_state("{}"))}
            >
            Insert Event
          </Button>
        </Stack>
      </Container>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h2">
          Event Stream
        </Typography>
        <Stack direction="column" spacing={2}>
          <Container>Event1</Container>
          <Container>Event2</Container>
          <Container>Event3</Container>
          <Container>Event4</Container>
        </Stack>
      </Container>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h2">
          Event Stream
        </Typography>
        <Stack direction="column" spacing={2}>
          <Container>Event1</Container>
          <Container>Event2</Container>
          <Container>Event3</Container>
          <Container>Event4</Container>
        </Stack>
      </Container>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h2">
          Event Stream
        </Typography>
        <Stack direction="column" spacing={2}>
          <EventFetcher 
            client={client}
            render = {(events, error) => <>
              <Container>Event1</Container>
              <Container>Event2</Container>
              <Container>Event3</Container>
              <Container>Event4</Container>
            </>
            }
          />
        </Stack>
      </Container>
    </Stack>
  </Container>;
}


export default App;
