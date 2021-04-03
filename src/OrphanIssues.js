import React, { useContext, useEffect, useState } from "react"
import { useSWRInfinite } from "swr"
import fetcher from "./fetcher"
import UserContext from "./UserContext"
import { Loading, Error } from "./Messages"
import useCardInfo from "./hooks/useCardInfo"
import useCards from "./hooks/useCards"
import useColumns from "./hooks/useColumns"
import useProjects from "./hooks/useProjects"

import { makeStyles } from "@material-ui/core/styles"

import Button from "@material-ui/core/Button"
import Grid from "@material-ui/core/Grid"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Paper from "@material-ui/core/Paper"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Typography from "@material-ui/core/Typography"

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(12),
  },
}))

const IssueCardInfo = ({ url, addIssue }) => {
  const userctx = useContext(UserContext)
  const { info, isLoading, error } = useCardInfo(url, userctx.token)
  const [once, setOnce] = useState(true)
  useEffect(() => {
    if (once && info) {
      addIssue(info.number)
      setOnce(false)
    }
  }, [info, addIssue, once])
  if (isLoading) {
    return (
      <Typography variant="body2" gutterBottom>
        <Loading resource="card info" />
      </Typography>
    )
  }
  if (error) {
    return (
      <Typography variant="body2" gutterBottom>
        <Error resource="card info" error={error} />
      </Typography>
    )
  }
  return (
    <Typography variant="body2" gutterBottom>
      #{info.number} - {info.title}
    </Typography>
  )
}

const Cards = ({ url, addIssue }) => {
  const userctx = useContext(UserContext)
  const { cards, isLoading, error } = useCards(url, userctx.token)

  if (isLoading) return <Loading resource="project cards" />
  if (error) return <Error resource="project cards" error={error} />

  return (
    <React.Fragment>
      {cards.map((c, i) =>
        c.content_url ? (
          <ListItem button key={`list-card-${c.id}`}>
            <IssueCardInfo
              key={`card-${c.id}`}
              url={c.content_url}
              addIssue={addIssue}
            />
          </ListItem>
        ) : null
      )}
    </React.Fragment>
  )
}

const Columns = ({ url, addIssue }) => {
  const userctx = useContext(UserContext)
  const { columns, isLoading, error } = useColumns(url, userctx.token)

  if (isLoading) return <Loading resource="project columns" />
  if (error) return <Error resource="project columns" error={error} />

  return (
    <React.Fragment>
      {columns.map((col, i) => (
        <Cards key={`${col.id}`} url={col.cards_url} addIssue={addIssue} />
      ))}
    </React.Fragment>
  )
}

const ProjectList = ({ org, repo, addIssue }) => {
  const userctx = useContext(UserContext)
  const { projects, isLoading, error } = useProjects(org, repo, userctx.token)

  if (isLoading) return <Loading resource="project issues" />
  if (error) return <Error resource="project issues" error={error} />

  return (
    <React.Fragment>
      {projects.map((p, i) => (
        <Columns key={`${p.id}`} url={p.columns_url} addIssue={addIssue} />
      ))}
    </React.Fragment>
  )
}

const Issue = ({ number }) => {
  return <ListItem>#{number}</ListItem>
}

const OrphanIssues = ({ org, repo, allIssuesMap }) => {
  const classes = useStyles()
  const [issuesInProjectMap, setIssuesInProjectMap] = useState({})
  const [issuesNotInProjects, setIssuesNotInProjects] = useState({})

  useEffect(() => {
    const intersection = Object.keys(allIssuesMap).filter(
      (x) => !(x in issuesInProjectMap)
    )

    setIssuesNotInProjects((prev) =>
      Object.assign({}, ...intersection.map((x) => ({ [x]: null })))
    )
  }, [Object.keys(issuesInProjectMap).length, Object.keys(allIssuesMap).length])

  const addIssue = (number) => {
    setIssuesInProjectMap((prevMap) => ({ ...prevMap, [number]: null }))
  }

  return (
    <React.Fragment>
      <Grid container spacing={3} className={classes.container}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Orphan issues:
          </Typography>
          <Typography variant="body1" gutterBottom>
            Opened issues gathered: {Object.keys(allIssuesMap).length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Issues linked to projects: {Object.keys(issuesInProjectMap).length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Issues not linked to projects:{" "}
            {Object.keys(issuesNotInProjects).length}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <ProjectList org={org} repo={repo} addIssue={addIssue} />
        </Grid>
        <Grid item xs={6}>
          <List dense>
            {Object.keys(issuesNotInProjects).map((i, k) => (
              <Issue key={`orphan-issue-${i}`} number={i} />
            ))}
          </List>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default OrphanIssues
