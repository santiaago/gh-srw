import { red } from "@material-ui/core/colors"
// https://stackoverflow.com/a/64135466/989227
import { unstable_createMuiStrictModeTheme as createMuiTheme } from "@material-ui/core/styles"

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
})

export default theme
