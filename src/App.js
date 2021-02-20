import "./App.css"
import useSWR, { useSWRInfinite, SWRConfig } from "swr"
import React, { useContext, useState } from "react"
import Box from "@material-ui/core/Box"
import AppBar from "./AppBar"
import fetcher from "./fetcher"
import UserContext from "./UserContext"
import ProfileCard from "./ProfileCard"
import Grid from "@material-ui/core/Grid"
import TextField from "@material-ui/core/TextField"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"
import Repo from "./Repo"
import Issues from "./Issues"
import Projects from "./Projects"
import MenuItem from "@material-ui/core/MenuItem"
import Select from "@material-ui/core/Select"

const useIssues = (owner, repo, pageIndex, token) => {
  const { data, error } = useSWR(
    [
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&page=${pageIndex}`,
      token,
    ],
    fetcher
  )
  return {
    issues: data,
    isLoading: !error && !data,
    error: error,
  }
}

const Issues2 = (props) => {
  const { owner, reponame, pageIndex } = props
  const userctx = useContext(UserContext)
  const { issues, isLoading, error } = useIssues(
    owner,
    reponame,
    pageIndex,
    userctx.token
  )
  if (isLoading) return <div>loading issues...</div>
  if (error)
    return (
      <div>
        failed to load issues, info:{error.info.message} status:{error.status}{" "}
        message:{error.message}
      </div>
    )

  console.log(issues)
  return (
    <div>
      {issues.map((i) => (
        <div key={i.node_id}>
          <div>{i.title}</div>
          <div>state: {i.state}</div>
          <div>{i.created_at}</div>
        </div>
      ))}
    </div>
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

  if (isLoading) {
    return "loading repo"
  }
  if (error) {
    return "unable to load repo"
  }

  const handleChange = (event) => {
    onChange(event.target.value)
  }

  console.log(repos)
  return (
    <Select value={repo} onChange={handleChange}>
      {repos
        .sort((r) => r.full_name)
        .map((r) => (
          <MenuItem value={r}>{r.name}</MenuItem>
        ))}
    </Select>
  )
}

const SelectOrg = ({ org, url, onChange }) => {
  const userctx = useContext(UserContext)
  const { orgs, isLoading, error } = useOrganisations(url, userctx.token)

  if (isLoading) {
    return "loading org"
  }
  if (error) {
    return "unable to load org"
  }

  const handleChange = (event) => {
    onChange(event.target.value)
  }

  console.log(orgs)
  return (
    <Select value={org} onChange={handleChange}>
      {orgs.map((o) => (
        <MenuItem value={o}>{o.login}</MenuItem>
      ))}
    </Select>
  )
}

  )
}

const Settings = ({ onSubmit }) => {
  const [repo, setRepo] = useState()
  const [owner, setOwner] = useState()

  const handleRepoChange = (event) => {
    setRepo(event.target.value)
  }

  const handleOwnerChange = (event) => {
    setOwner(event.target.value)
  }

  const handleSubmit = async (owner, repo) => {
    try {
      console.log("handle submit", owner, repo)
      onSubmit(owner, repo)
    } catch (err) {
      console.error("something went wrong while adding organisation", err)
    }
  }

  return (
    <Paper>
      <form noValidate autoComplete="off">
        <TextField
          id="standard-basic"
          label="Owner"
          onChange={handleOwnerChange}
        />
        <TextField
          id="standard-basic"
          label="Repo"
          onChange={handleRepoChange}
        />
        <Button onClick={() => handleSubmit(owner, repo)} color="primary">
          Submit
        </Button>
      </form>
    </Paper>
  )
}

function App() {
  const token = process.env.REACT_APP_GH_TOKEN;
  console.log("token", token, process.env)
  const userContext = { token }
  const [repo, setRepo] = useState()
  const [owner, setOwner] = useState()
  const [pageCount, setPageCount] = useState(0)

  const onSettingsSubmit = (owner, repo) => {
    setOwner(owner)
    setRepo(repo)
  }

  return (
    <UserContext.Provider value={userContext}>
      <SWRConfig value={{ shouldRetryOnError: false }}>
        <AppBar />
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <ProfileCard />
            </Grid>
            <Grid item xs={8}>
              <Settings onSubmit={onSettingsSubmit} />
            </Grid>
          </Grid>
          {owner && repo && <Repo owner={owner} repo={repo} />}
          {owner && repo && <Issues owner={owner} repo={repo} />}
          {owner && repo && <Projects owner={owner} repo={repo} />}
        </Box>
      </SWRConfig>
    </UserContext.Provider>
  )
}

export default App
