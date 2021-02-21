import { useContext } from "react"

import { makeStyles } from "@material-ui/core/styles"
import UserContext from "./UserContext"
import useRepo from "./hooks/useRepo"
import Paper from "@material-ui/core/Paper"
import Grid from "@material-ui/core/Grid"
import { Typography } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
}))

const Repo = ({ org, repo: repoName }) => {
  const classes = useStyles()
  const userctx = useContext(UserContext)
  const { repo, isLoading, error } = useRepo(org, repoName, userctx.token)
  if (isLoading) return <div>loading repo...</div>
  if (error)
    return (
      <div>
        failed to load repo, info:{error.info && error.info.message} status:
        {error.status} message:{error.message}
      </div>
    )

  console.log(repo)
  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Typography variant="h2" gutterBottom>
          {repo.name}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default Repo
