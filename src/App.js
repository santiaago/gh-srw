import "./App.css"
import useSWR, { SWRConfig } from "swr"
import React, { useContext, useState } from "react"

import { makeStyles } from "@material-ui/core/styles"
import { Route, Switch } from "react-router"
import { useHistory } from "react-router-dom"

import useProfile from "./hooks/useProfile"
import fetcher from "./fetcher"

import Issues from "./Issues"
import ProfileCard from "./ProfileCard"
import Projects from "./Projects"
import Repo from "./Repo"
import TimelineSection from "./Timeline"
import TopAppBar, { FooterBar } from "./AppBar"
import UserContext from "./UserContext"

import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Container from "@material-ui/core/Container"
import FormControl from "@material-ui/core/FormControl"
import Grid from "@material-ui/core/Grid"
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import Paper from "@material-ui/core/Paper"
import Select from "@material-ui/core/Select"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"

const useOrganisations = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    orgs: data,
    isLoading: !error && !data,
    error: error,
  }
}

const useRepos = (url, token) => {
  const { data, error } = useSWR([`${url}?per_page=100`, token], fetcher)
  const byname = (r1, r2) => {
    if (r1.full_name.toLowerCase() < r2.full_name.toLowerCase()) {
      return -1
    }
    if (r1.full_name.toLowerCase() > r2.full_name.toLowerCase()) {
      return 1
    }
    return 0
  }

  return {
    repos: data && data.sort(byname),
    isLoading: !error && !data,
    error: error,
  }
}

const SelectRepo = ({ repo, url, onChange }) => {
  const userctx = useContext(UserContext)
  const { repos, isLoading, error } = useRepos(url, userctx.token)

  const useStyles = makeStyles((theme) => ({
    formControl: {
      minWidth: 166,
    },
  }))
  const classes = useStyles()

  const handleChange = (event) => {
    onChange(event.target.value)
  }

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="org-select-label">Repo</InputLabel>
      <Select value={repo} onChange={handleChange}>
        {repos &&
          repos
            .sort((r) => r.full_name)
            .map((r) => (
              <MenuItem key={`repos-${r.id}`} value={r}>
                {r.name}
              </MenuItem>
            ))}
      </Select>
    </FormControl>
  )
}

const SelectOrg = ({ org, url, onChange }) => {
  const userctx = useContext(UserContext)
  const { orgs, isLoading, error } = useOrganisations(url, userctx.token)

  const useStyles = makeStyles((theme) => ({
    formControl: {
      minWidth: 166,
    },
  }))
  const classes = useStyles()

  const handleChange = (event) => {
    onChange(event.target.value)
  }

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="org-select-label">Organisation</InputLabel>
      <Select value={org} onChange={handleChange}>
        {orgs &&
          orgs.map((o) => (
            <MenuItem key={`org-${o.id}`} value={o}>
              {o.login}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  )
}

const SelectSettings = ({ onSubmit }) => {
  const userctx = useContext(UserContext)
  const { user, isLoading, error } = useProfile(userctx.token)
  const [org, setOrg] = useState("")
  const [repo, setRepo] = useState("")
  const useStyles = makeStyles((theme) => ({
    form: {
      display: "flex",
    },
  }))
  const classes = useStyles()
  if (isLoading) {
    return "loading settings"
  }
  if (error) {
    return "unable to load settings"
  }

  const onOrgChange = (org) => {
    console.log(org)
    setOrg(org)
  }
  const onRepoChange = (repo) => {
    console.log(repo)
    setRepo(repo)
  }
  const onSubmitSettings = () => {
    if (org && repo) {
      onSubmit(org.login, repo.name)
    }
  }

  return (
    <form noValidate autoComplete="off" className={classes.form}>
      <SelectOrg
        org={org}
        url={user.organizations_url}
        onChange={onOrgChange}
      />
      <SelectRepo
        repo={repo}
        url={org && org.repos_url}
        onChange={onRepoChange}
      />
      <Button color="primary" size="large" onClick={onSubmitSettings}>
        Submit
      </Button>
    </form>
  )
}

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
      console.log("handle submit", org, repo)
      onSubmit(org, repo)
    } catch (err) {
      console.error("something went wrong while adding organisation", err)
    }
  }

  return (
    <form noValidate autoComplete="off" className={classes.form}>
      <TextField
        id="standard-basic"
        label="Organisation"
        onChange={handleOrgChange}
        value={org}
      />
      <TextField id="standard-basic" label="Repo" onChange={handleRepoChange} />
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

const RepoSection = ({ org, repo }) => {
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
      history.push("/projects")
    } else if (newValue === 2) {
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
        <Tab label="projects" />
        <Tab label="timeline" />
      </Tabs>
      <Switch>
        <Route path="/issues">
          {org && repo && <Issues org={org} repo={repo} />}
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
  console.log("token", token, process.env)

  const userContext = { token }
  const [repo, setRepo] = useState()
  const [org, setOrg] = useState()

  const onSettingsSubmit = (org, repo) => {
    setOrg(org)
    setRepo(repo)
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
                  <Grid item xs={12}>
                    <SelectSettings onSubmit={onSettingsSubmit} />
                  </Grid>
                </Grid>
              </Grid>
            </Container>
          </Paper>
          <Paper>
            <Container maxWidth="xl">
              <RepoSection org={org} repo={repo} />
            </Container>
          </Paper>
        </Box>
        <FooterBar />
      </SWRConfig>
    </UserContext.Provider>
  )
}

export default App
