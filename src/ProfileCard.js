import React, { useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"

import useProfile from "./hooks/useProfile"
import UserContext from "./UserContext"

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
})

const ProfileCard = () => {
  const classes = useStyles()
  const userctx = useContext(UserContext)
  const { user, isLoading, error } = useProfile(userctx.token)

  if (isLoading) return <div>loading...</div>
  if (error)
    return (
      <div>
        failed to load profile, info:{error.info.message} status:{error.status}{" "}
        message:{error.message}
      </div>
    )

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {user.login}
        </Typography>
        <Typography variant="body2" component="p">
          {user.html_url}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ProfileCard
