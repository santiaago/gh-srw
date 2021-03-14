import React, { useContext, useState } from "react"
import useSWR from "swr"
import fetcher from "./fetcher"
import UserContext from "./UserContext"

import { makeStyles } from "@material-ui/core/styles"

import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Typography from "@material-ui/core/Typography"

const Loading = ({ resource }) => {
  return <div>loading {resource}...</div>
}

const Error = ({ resource, error }) => {
  return (
    <div>
      failed to load {resource}, info:{error.info && error.info.message} status:
      {error.status} message:{error.message}
    </div>
  )
}

const useProjects = (org, repo, token) => {
  const { data, error } = useSWR(
    [`https://api.github.com/repos/${org}/${repo}/projects?state=open`, token],
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

const ProjectList = ({ org, repo, onSelected }) => {
  const userctx = useContext(UserContext)
  const { projects, isLoading, error } = useProjects(org, repo, userctx.token)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)

  if (isLoading) return <Loading resource="projects" />
  if (error) return <Error resource="projects" error={error} />

  const onProjectClicked = (p, i) => {
    setSelectedIndex(i)
    onSelected(p)
  }

  return (
    <List component="nav" aria-label="secondary" dense>
      {projects.map((p, i) => (
        <ListItem
          button
          key={`list-project-${p.id}`}
          selected={i === selectedIndex}
          onClick={() => onProjectClicked(p, i)}
        >
          <ListItemText primary={p.name} />
        </ListItem>
      ))}
    </List>
  )
}

const ColumnsList = ({ url, onColumnSelected }) => {
  const userctx = useContext(UserContext)
  const { columns, isLoading, error } = useColumns(url, userctx.token)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)

  if (isLoading) return <Loading resource="columns" />
  if (error) return <Error resource="columns" error={error} />

  const onColumnClicked = (c, i) => {
    setSelectedIndex(i)
    console.log(c)
    onColumnSelected(c)
  }

  return (
    <List component="nav" aria-label="secondary" dense>
      {columns.map((c, i) => (
        <ListItem
          button
          key={`list-cols-${c.id}`}
          selected={i === selectedIndex}
          onClick={() => onColumnClicked(c, i)}
        >
          <ListItemText primary={c.name} />
        </ListItem>
      ))}
    </List>
  )
}

const CardsList = ({ url }) => {
  const userctx = useContext(UserContext)
  const { cards, isLoading, error } = useCards(url, userctx.token)

  if (isLoading) return <Loading resource="cards" />
  if (error) return <Error resource="cards" error={error} />

  return (
    <List component="nav" aria-label="secondary" dense>
      {cards.map((c, i) => (
        <ListItem button key={`list-card-${c.id}`}>
          <CardInfo key={`card-${c.id}`} url={c.content_url} />
        </ListItem>
      ))}
    </List>
  )
}

const CardInfo = ({ url }) => {
  const userctx = useContext(UserContext)
  const { info, isLoading, error } = useCardInfo(url, userctx.token)

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
      {info.title}
    </Typography>
  )
}

const ProjectCards = ({ col }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cards of {col.name}
      </Typography>
      <CardsList url={col.cards_url} />
    </Box>
  )
}

const ProjectSection = ({ project, onColumnSelected }) => {
  return (
    <Box>
      <ColumnsList
        url={project.columns_url}
        onColumnSelected={onColumnSelected}
      />
    </Box>
  )
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(12),
  },
}))

const Projects = ({ org, repo }) => {
  const classes = useStyles()
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
      <Grid container spacing={3} className={classes.container}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Projects:
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <ProjectList
                org={org}
                repo={repo}
                onSelected={onProjectSelected}
              />
            </Grid>
            <Grid item xs={2}>
              {project && (
                <ProjectSection
                  project={project}
                  onColumnSelected={onColumnSelected}
                />
              )}
            </Grid>
            <Grid item xs={8}>
              {col && <ProjectCards col={col} />}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default Projects
