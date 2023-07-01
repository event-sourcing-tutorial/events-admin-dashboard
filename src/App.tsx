import './App.css';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {Stack} from '@mui/system';
import {Container, TextField, Typography} from '@mui/material';
import {parse} from "json5";
import {useState} from 'react';
import {JSONEditor} from './JSONEditor';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: "4rem",
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

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main><MyApp /></main>
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

function MyApp() {
  const [state, setstate] = useState(make_state("{}"));
  return <>
    <Typography variant="h1">
      Events
    </Typography>
    <Container maxWidth="sm">
      <Stack direction="column" spacing={2}>
        <TextField
          id="eventidx"
          label="Event Index"
          type="number"
          variant='standard' 
          InputLabelProps={{
            shrink: true,
          }}
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
  </>;
}


export default App;
