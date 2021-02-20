import React, { useContext } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"

import useProfile from "./hooks/useProfile"
import UserContext from "./UserContext"


const ProfileCard = () => {
  const userctx = useContext(UserContext)
  const { user, isLoading, error } = useProfile(userctx.token)

  if (isLoading) return <div>loading...</div>
  if (error)
    return (
      <div>
        failed to load profile, info:{error.info && error.info.message} status:{error.status}{" "}
        message:{error.message}
      </div>
    )

  return (
    <React.Fragment>
      <Typography color="textSecondary" variant="h5" gutterBottom>
        {user.login}
      </Typography>
      <Typography variant="body2" component="p">
        {user.html_url}
      </Typography>
    </React.Fragment>
  )
}

export default ProfileCard
