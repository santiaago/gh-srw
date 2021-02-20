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
