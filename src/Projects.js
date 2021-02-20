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

const Loading =({resource}) => {
  return <div>loading {resource}...</div>
}

const Error = ({resource, error}) => {
    return (
      <div>
        failed to load {resource}, info:{error.info.message} status:{error.status}{" "}
        message:{error.message}
      </div>
    )
}

const useProjects = (owner, repo, token) => {
  const { data, error } = useSWR(
    [
      `https://api.github.com/repos/${owner}/${repo}/projects?state=open`,
      token,
    ],
    fetcher
  )
  return {
    projects: data,
    isLoading: !error && !data,
    error: error,
  }
}

const useColumns = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    columns: data,
    isLoading: !error && !data,
    error: error,
  }
}

const useCards = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    cards: data,
    isLoading: !error && !data,
    error: error,
  }
}

const useCardInfo = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    info: data,
    isLoading: !error && !data,
    error: error,
  }
}

const ProjectList = ({ owner, repo, onSelected }) => {
  const userctx = useContext(UserContext)
  const { projects, isLoading, error } = useProjects(owner, repo, userctx.token)

  if (isLoading) return <Loading resource="projects"/>
  if (error) return <Error resource="projects" error={error} />

  const onProjectClicked = (p) => {
    onSelected(p)
  }

  return (
    <List component="nav" aria-label="secondary">
      {projects.map((p) => (
        <ListItem button key={`list-project-${p.id}`}>
          <ListItemText primary={p.name} onClick={() => onProjectClicked(p)} />
        </ListItem>
      ))}
    </List>
  )
}

const ColumnsList = ({ url, onColumnSelected }) => {
  const userctx = useContext(UserContext)
  const { columns, isLoading, error } = useColumns(url, userctx.token)

  if (isLoading) return <Loading resource="columns"/>
  if (error) return <Error resource="columns" error={error} />

  const onColumnClicked = (c) => {
    console.log(c)
    onColumnSelected(c)
  }

  return (
    <List component="nav" aria-label="secondary">
      {columns.map((c) => (
        <ListItem button key={`list-cols-${c.id}`}>
          <ListItemText primary={c.name} onClick={() => onColumnClicked(c)} />
        </ListItem>
      ))}
    </List>
  )
}

const CardInfo = ({url}) => {
  const userctx = useContext(UserContext)
  const { info, isLoading, error } = useCardInfo(url, userctx.token)

  if (isLoading) return <Loading resource="card info"/>
  if (error) return <Error resource="card info" error={error} />

  console.log(info)
  return (
    <Typography variant="body2" gutterBottom>
      {info.title}
    </Typography>

  )
}

const ProjectCards = ({col}) => {
  console.log("project cards, col", col)
  const userctx = useContext(UserContext)
  const { cards, isLoading, error } = useCards(col.cards_url, userctx.token)

  if (isLoading) return <Loading resource="cards"/>
  if (error) return <Error resource="cards" error={error} />

  console.log(cards)
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cards of {col.name}
      </Typography>
      {cards.map(c => (
        <CardInfo key={`card-${c.id}`} url={c.content_url} />
      ))}
    </Box>
  )
}

const ProjectSection = ({ project, onColumnSelected }) => {
  console.log(project)
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selected project {project.name}
      </Typography>
      <ColumnsList url={project.columns_url} onColumnSelected={onColumnSelected} />
    </Box>
  )
}

const Projects = ({ owner, repo }) => {
  const [project, setProject] = useState()
  const [col, setCol] = useState()

  const onProjectSelected = (project) => {
    setProject(project)
  }

  const onColumnSelected = (col) => {
    setCol(col)
  }

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Projects:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <ProjectList
                owner={owner}
                repo={repo}
                onSelected={onProjectSelected}
              />
            </Grid>
            <Grid item xs={8}>
              {project && <ProjectSection project={project} onColumnSelected={onColumnSelected} />}
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {col && <ProjectCards col={col} />}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default Projects
