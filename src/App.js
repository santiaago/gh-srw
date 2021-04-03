import "./App.css"
import { SWRConfig } from "swr"
import React, { useState } from "react"

import { makeStyles } from "@material-ui/core/styles"
import { Route, Switch } from "react-router"
import { useHistory } from "react-router-dom"

import Issues from "./Issues"
import OrphanIssues from "./OrphanIssues"
import ProfileCard from "./ProfileCard"
import Projects from "./Projects"
import Repo from "./Repo"
import TimelineSection from "./Timeline"
import TopAppBar, { FooterBar } from "./AppBar"
import UserContext from "./UserContext"

import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"

const TypeSettings = ({ onSubmit }) => {
  const [repo, setRepo] = useState()
  const [org, setOrg] = useState("")

  const useStyles = makeStyles((theme) => ({
    form: {
      display: "flex",
    },
  }))
  const classes = useStyles()

  const handleRepoChange = (event) => {
    setRepo(event.target.value)
  }

  const handleOrgChange = (event) => {
    setOrg(event.target.value)
  }

  const handleSubmit = async (org, repo) => {
    try {
      onSubmit(org, repo)
    } catch (err) {
      console.error("something went wrong while adding organisation", err)
    }
  }

  return (
    <form noValidate autoComplete="off" className={classes.form}>
      <TextField
        id="input-org"
        label="Organisation"
        onChange={handleOrgChange}
        value={org}
      />
      <TextField id="input-repo" label="Repo" onChange={handleRepoChange} />
      <Button
        size="large"
        color="primary"
        onClick={() => handleSubmit(org, repo)}
      >
        Submit
      </Button>
    </form>
  )
}

const RepoSection = ({ org, repo, addIssues, allIssuesMap }) => {
  const history = useHistory()
  const [currentTab, setCurrentTab] = useState(0)

  const useStyles = makeStyles((theme) => ({
    empty: {
      paddingTop: theme.spacing(12),
      minHeight: theme.spacing(70),
    },
  }))
  const classes = useStyles()

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      history.push("/issues")
    } else if (newValue === 1) {
      history.push("/orphan-issues")
    } else if (newValue === 2) {
      history.push("/projects")
    } else if (newValue === 3) {
      history.push("/timeline")
    }
    setCurrentTab(newValue)
  }

  if (!org || !repo) {
    return (
      <Box className={classes.empty}>
        <Typography variant="h6" gutterBottom>
          Select an organisation and a repo to explore
        </Typography>
      </Box>
    )
  }

  return (
    <React.Fragment>
      {org && repo && <Repo org={org} repo={repo} />}
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab label="issues" />
        <Tab label="orphan-issues" />
        <Tab label="projects" />
        <Tab label="timeline" />
      </Tabs>
      <Switch>
        <Route path="/issues">
          {org && repo && (
            <Issues org={org} repo={repo} addIssues={addIssues} />
          )}
        </Route>
        <Route path="/orphan-issues">
          {org && repo && (
            <OrphanIssues org={org} repo={repo} allIssuesMap={allIssuesMap} />
          )}
        </Route>
        <Route path="/projects">
          {org && repo && <Projects org={org} repo={repo} />}
        </Route>
        <Route path="/timeline">
          {org && repo && <TimelineSection org={org} repo={repo} />}
        </Route>
      </Switch>
    </React.Fragment>
  )
}

function App() {
  const token = process.env.REACT_APP_GH_TOKEN
  console.log("token and env:", token, process.env)

  const history = useHistory()
  const userContext = { token }
  const [repo, setRepo] = useState()
  const [org, setOrg] = useState()
  const [allIssuesMap, setAllIssuesMap] = useState({})

  const addIssues = (newIssues) => {
    setAllIssuesMap((prevMap) => ({ ...prevMap, ...newIssues }))
  }

  const onSettingsSubmit = (org, repo) => {
    setOrg(org)
    setRepo(repo)
    history.push("/issues")
  }

  return (
    <UserContext.Provider value={userContext}>
      <SWRConfig value={{ shouldRetryOnError: false }}>
        <TopAppBar />
        <Box>
          <Paper>
            <Container maxWidth="xl">
              <Grid container spacing={3}>
                <Grid xs={4} item>
                  <ProfileCard />
                </Grid>
                <Grid xs={8} item container spacing={2}>
                  <Grid item xs={12}>
                    <TypeSettings onSubmit={onSettingsSubmit} />
                  </Grid>
                </Grid>
              </Grid>
            </Container>
          </Paper>
          <Paper>
            <Container maxWidth="xl">
              <RepoSection
                org={org}
                repo={repo}
                addIssues={addIssues}
                allIssuesMap={allIssuesMap}
              />
            </Container>
          </Paper>
        </Box>
        <FooterBar />
      </SWRConfig>
    </UserContext.Provider>
  )
}

export default App
