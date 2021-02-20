import "./App.css"
import useSWR, { useSWRInfinite, SWRConfig } from "swr"
import React, { useContext, useState } from "react"
import Box from "@material-ui/core/Box"
import AppBar from "./AppBar"
import fetcher from "./fetcher"
import UserContext from "./UserContext"
import ProfileCard from "./ProfileCard"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import TextField from "@material-ui/core/TextField"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"
import Repo from "./Repo"
import Issues from "./Issues"
import Projects from "./Projects"
import useProfile from "./hooks/useProfile"
import MenuItem from "@material-ui/core/MenuItem"
import Select from "@material-ui/core/Select"
import InputLabel from "@material-ui/core/InputLabel"
import { findByLabelText } from "@testing-library/react"
import { makeStyles } from "@material-ui/core/styles"
import FormControl from "@material-ui/core/FormControl"

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

  console.log(repos)
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="org-select-label">Repo</InputLabel>
      <Select value={repo} onChange={handleChange}>
        {repos &&
          repos
            .sort((r) => r.full_name)
            .map((r) => <MenuItem value={r}>{r.name}</MenuItem>)}
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

  console.log(orgs)
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="org-select-label">Organisation</InputLabel>
      <Select value={org} onChange={handleChange}>
        {orgs && orgs.map((o) => <MenuItem value={o}>{o.login}</MenuItem>)}
      </Select>
    </FormControl>
  )
}

const SelectSettings = ({ onSubmit }) => {
  const userctx = useContext(UserContext)
  const { user, isLoading, error } = useProfile(userctx.token)
  const [org, setOrg] = useState()
  const [repo, setRepo] = useState()
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
  const [org, setOrg] = useState()

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

function App() {
  const token = process.env.REACT_APP_GH_TOKEN
  console.log("token", token, process.env)
  const userContext = { token }
  const [repo, setRepo] = useState()
  const [org, setOrg] = useState()
  const [pageCount, setPageCount] = useState(0)

  const onSettingsSubmit = (org, repo) => {
    setOrg(org)
    setRepo(repo)
  }

  return (
    <UserContext.Provider value={userContext}>
      <SWRConfig value={{ shouldRetryOnError: false }}>
        <AppBar />
        <Box>
          <Paper>
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
          </Paper>
          <Paper>
            {org && repo && <Repo org={org} repo={repo} />}
            {org && repo && <Issues org={org} repo={repo} />}
            {org && repo && <Projects org={org} repo={repo} />}
          </Paper>
        </Box>
      </SWRConfig>
    </UserContext.Provider>
  )
}

export default App
