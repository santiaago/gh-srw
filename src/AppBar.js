import React, { useContext } from "react"

import { makeStyles } from "@material-ui/core/styles"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import MenuIcon from "@material-ui/icons/Menu"

import UserContext from "./UserContext"
import useProfile from "./hooks/useProfile"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}))

const TopAppBar = () => {
  const userctx = useContext(UserContext)
  const { user, isLoading, error } = useProfile(userctx.token)
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            SWR and github showcase
          </Typography>
          <Typography>
              {isLoading? "loading...": null}
              {error? "failed loading profile": null}
              {user && user.login}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export const FooterBar = ({}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="body2">
          SWR and github showcase by @santiaago
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default TopAppBar
