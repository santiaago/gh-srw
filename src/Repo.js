import { useContext } from "react"

import { makeStyles } from "@material-ui/core/styles"
import UserContext from "./UserContext"
import useRepo from "./hooks/useRepo"
import Paper from "@material-ui/core/Paper"
import Grid from "@material-ui/core/Grid"

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
}))

const Repo = ({ owner, repo: repoName }) => {
  const classes = useStyles()
  const userctx = useContext(UserContext)
  const { repo, isLoading, error } = useRepo(owner, repoName, userctx.token)
  if (isLoading) return <div>loading repo...</div>
  if (error)
    return (
      <div>
        failed to load repo, info:{error.info.message} status:{error.status}{" "}
        message:{error.message}
      </div>
    )

  console.log(repo)
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper className={classes.paper}><h1>{repo.name}</h1></Paper>
      </Grid>
    </Grid>
  )
}

export default Repo
