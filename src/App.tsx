import './App.css';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {Stack} from '@mui/system';
import {Container, TextField} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: ["Menlo", "Ubuntu Mono", "Monaco", "monospace"].join(","),
        },
      }
    },
  },
});

const Editor = () => 
  <CodeMirror
      value="{}"
  //minHeight="200px"
      extensions={[json()]}
      theme="dark"
      editable={true}
      basicSetup={{
        lineNumbers: false,
      }}
      onChange={(value) => {
        console.log(value);
      }}
   />;


function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main><MyApp /></main>
    </ThemeProvider>
  );
}


function MyApp() {
  return (
    <Container maxWidth="sm">
      <Stack direction="column" spacing={2}>
        <TextField fullWidth multiline rows={4}  />
        <Editor />
        <Button variant="contained">Hello World</Button>
        <Button variant="contained">Hello World</Button>
        <Button variant="contained">Hello World</Button>
      </Stack>
    </Container>
  );
}


export default App;
