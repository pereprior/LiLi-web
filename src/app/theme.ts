import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#6D5AA6', contrastText: '#FFFFFF' },
        secondary: { main: '#6D5AA6', contrastText: '#FFFFFF' },
        background: { default: '#F7F6FA', paper: '#FFFFFF' },
        text: { primary: '#262230', secondary: '#655F70' },
        action: { selected: '#EEE9F7' },
        success: { main: '#2E7D65', contrastText: '#FFFFFF' },
        warning: { main: '#946200', contrastText: '#FFFFFF' },
        error: { main: '#B54755', contrastText: '#FFFFFF' },
        info: { main: '#356D9A', contrastText: '#FFFFFF' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#B9A5E8', contrastText: '#262230' },
        secondary: { main: '#B9A5E8', contrastText: '#262230' },
        background: { default: '#17141D', paper: '#221E2A' },
        text: { primary: '#F2EEF8', secondary: '#B9B2C5' },
        action: { selected: '#332A46' },
        success: { main: '#7BC9AB', contrastText: '#262230' },
        warning: { main: '#E4BA67', contrastText: '#262230' },
        error: { main: '#EF9AA5', contrastText: '#262230' },
        info: { main: '#8FBDDF', contrastText: '#262230' },
      },
    },
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCssBaseline: {
      styleOverrides: {
        body: { minWidth: 320 },
      },
    },
  },
});
