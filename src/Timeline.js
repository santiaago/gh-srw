import React, { useContext, useState } from "react"
import useSWR, { useSWRInfinite } from "swr"
import fetcher from "./fetcher"
import UserContext from "./UserContext"

import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import Box from "@material-ui/core/Box"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import TablePagination from "@material-ui/core/TablePagination"
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import { Typography } from "@material-ui/core"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import Divider from "@material-ui/core/Divider"
import InboxIcon from "@material-ui/icons/Inbox"
import DraftsIcon from "@material-ui/icons/Drafts"

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(12),
  },
}))

const Timeline = ({ org, repo }) => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <Grid container spacing={3} className={classes.container}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Timeline:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <div>timeline here...</div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default Timeline
