import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {Stack} from '@mui/system';
import {Container, Typography} from '@mui/material';
import {JSONViewer} from './JSONEditor';
import { EventFetcher } from './EventFetcher';
import {EventsApisClientImpl} from '@event-sourcing-tutorial/eventsapis-proto';
import {InsertEventContainer} from './InsertEventContainer';
import {InsertCommandContainer} from './InsertCommandContainer';
import {Client, Event, QueueCommand} from './messages';

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

function App({client, events_client, queue_client}: {client: EventsApisClientImpl, events_client: Client<Event>, queue_client: Client<QueueCommand>}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main><MyApp client={client} events_client={events_client} queue_client={queue_client} /></main>
    </ThemeProvider>
  );
}


function MyApp({client, events_client, queue_client}: {client: EventsApisClientImpl, events_client: Client<Event>, queue_client: Client<QueueCommand>}) {
  return <Container>
    <Typography variant="h1">
      Events
    </Typography>
    <Stack direction="row" spacing={2}>
      <Stack direction="column" width="420px" spacing={2}>
        <InsertCommandContainer client={client} />
        <InsertEventContainer client={client} />
      </Stack>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h2">
          Event Stream
        </Typography>
        <Stack direction="column" spacing={2}>
          <EventFetcher
            client={events_client}
            render = {(events, error) => <>
              {
                events.map(({idx, inserted, payload}) =>  {
                   const json = {idx: idx.toString(), inserted: inserted.toISOString(), payload};
                   return <Container key={idx.toString()} disableGutters>
                     <JSONViewer text={JSON.stringify(json, undefined, 2)} />
                  </Container>
                })
              }
            </>
            }
          />
        </Stack>
      </Container>
      <Container maxWidth="sm" disableGutters>
        <Typography variant="h2">
          Queue Stream
        </Typography>
        <Stack direction="column" spacing={2}>
          <EventFetcher
            client={queue_client}
            render = {(events, error) => <>
              {
                events.map(({idx, command_id, status, updated}) =>  {
                  const json = {
                      idx: idx.toString(),
                      command_id,
                      updated: updated.toISOString(),
                      status,
                  };
                  return <Container key={idx.toString()} disableGutters>
                    <JSONViewer text={JSON.stringify(json, undefined, 2)} />
                  </Container>
                })
              }
            </>
            }
          />
        </Stack>
      </Container>
      { false &&
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
      }
      { false &&
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
      }
    </Stack>
  </Container>;
}


export default App;
