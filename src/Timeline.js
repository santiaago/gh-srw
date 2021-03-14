import React, { useContext, useState } from "react"
import useSWR, { useSWRInfinite } from "swr"
import fetcher from "./fetcher"
import UserContext from "./UserContext"

import { makeStyles } from "@material-ui/core/styles"
import Tooltip from "@material-ui/core/Tooltip"
import DoneIcon from "@material-ui/icons/Done"
import Autocomplete from "@material-ui/lab/Autocomplete"
import ScheduleIcon from "@material-ui/icons/Schedule"
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty"
import TimelineOppositeContent from "@material-ui/lab/TimelineOppositeContent"
import Badge from "@material-ui/core/Badge"
import Link from "@material-ui/core/Link"
import TextField from "@material-ui/core/TextField"
import Paper from "@material-ui/core/Paper"
import Grid from "@material-ui/core/Grid"
import { Typography } from "@material-ui/core"
import useRepo from "./hooks/useRepo"
import Timeline from "@material-ui/lab/Timeline"
import TimelineItem from "@material-ui/lab/TimelineItem"
import TimelineSeparator from "@material-ui/lab/TimelineSeparator"
import TimelineConnector from "@material-ui/lab/TimelineConnector"
import TimelineContent from "@material-ui/lab/TimelineContent"
import TimelineDot from "@material-ui/lab/TimelineDot"

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(12),
  },
  cardItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: theme.spacing(0.2),
    padding: theme.spacing(0.2),
    minWidth: theme.spacing(20),
    maxWidth: theme.spacing(20),
  },
  cards: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paper: {
    padding: "6px 16px",
  },
}))

const getIssuesKey = (
  pageIndex,
  previousPageData,
  owner,
  repo,
  labels,
  token
) => {
  if (previousPageData && !previousPageData.length) return null
  return [
    `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${
      pageIndex + 1
    }&labels=${labels.join(",")}`,
    token,
  ]
}

const useLabels = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    labels: data,
    isLoading: !error && !data,
    error: error,
  }
}

const enrichIssues = (issues) => {
  if (!issues) {
    return issues
  }
  const firstDateStr = issues && issues[0].created_at
  const lastDateStr = issues && issues[issues.length - 1].created_at
  if (!firstDateStr || !lastDateStr) {
    return issues
  }
  const firstDate = new Date(firstDateStr)
  const lastDate = new Date(lastDateStr)
  console.log(firstDate)
  console.log(lastDate)

  let enriched = []
  const now = new Date(Date.now())
  for (
    let year = firstDate.getUTCFullYear();
    year <= now.getUTCFullYear();
    year++
  ) {
    for (let month = 0; month <= 11; month++) {
      if (
        year == firstDate.getUTCFullYear() &&
        month < firstDate.getUTCMonth()
      ) {
        continue
      }
      if (year == now.getUTCFullYear() && month > now.getUTCMonth()) {
        continue
      }
      enriched.push({
        id: `${Date.now()}-${month}-${year}`,
        title: new Date(year, month).toLocaleDateString("en-Gb", {
          year: "numeric",
          month: "short",
        }),
        state: `enriched`,
        number: `-`,
        created_at: `${Date.now()}`,
      })
      let issueCount = 0
      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i]
        const d = new Date(issue.created_at)
        if (d.getUTCFullYear() == year && d.getUTCMonth() == month) {
          enriched.push(issue)
          issueCount++
        }
      }
      enriched[enriched.length - issueCount - 1].monthCount = issueCount
    }
  }
  return enriched
}

const MonthTimelineItem = ({ issue }) => {
  return (
    <TimelineItem key={`i-${issue.title}`}>
      <TimelineOppositeContent>
        <Typography variant="h6" component="h1">
          {issue.title}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot>
          <Badge badgeContent={issue.monthCount} color="error">
            <ScheduleIcon />
          </Badge>
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent />
    </TimelineItem>
  )
}

const IssueTimelineItem = ({ issue }) => {
  const classes = useStyles()
  return (
    <TimelineItem key={`i-${issue.id}`}>
      <TimelineSeparator>
        <TimelineDot color={issue.state === "closed" ? "secondary" : "grey"}>
          {issue.state === "closed" ? <DoneIcon /> : <HourglassEmptyIcon />}
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Tooltip
          title={new Date(issue.created_at).toLocaleDateString("en-Gb", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
          placement="top"
          arrow
        >
          <Paper elevation={3} className={classes.paper}>
            <Typography variant="h6" component="h1">
              <Link href={issue.html_url}>#{issue.number}</Link>
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              {issue.title}
            </Typography>
          </Paper>
        </Tooltip>
      </TimelineContent>
    </TimelineItem>
  )
}

const TimelineList = ({ org, repo, labels }) => {
  const classes = useStyles()
  const userContext = useContext(UserContext)
  const { data, size, setSize } = useSWRInfinite(
    (pi, ppd) => getIssuesKey(pi, ppd, org, repo, labels, userContext.token),
    fetcher
  )
  console.log(data)
  const issues =
    data &&
    data
      .flat()
      .sort((a, b) => a.created_at - b.created_at)
      .reverse()

  const enriched = enrichIssues(issues)
  console.log(issues)
  console.log(enriched)
  return (
    <Timeline>
      {enriched &&
        enriched.map((issue) =>
          issue.state == "enriched" ? (
            <MonthTimelineItem issue={issue} />
          ) : (
            <IssueTimelineItem issue={issue} />
          )
        )}
    </Timeline>
  )
}

const LabelsList = ({ url, onChange }) => {
  const userContext = useContext(UserContext)
  const { labels, isLoading, error } = useLabels(
    `${url.replace("{/name}", "")}?per_page=100`,
    userContext.token
  )
  if (isLoading) {
    return "loading labels.."
  }
  if (error) {
    return "error labels"
  }

  const onLabelChange = (event, newLabels) => {
    onChange(newLabels)
  }

  return (
    <Autocomplete
      multiple
      id="multiple-limit-tags"
      options={labels}
      getOptionLabel={(option) => option.name}
      onChange={onLabelChange}
      renderInput={(params) => (
        <TextField
          label={params.name}
          {...params}
          variant="outlined"
          label="select labels"
          placeholder="postmortem"
        />
      )}
    />
  )
}

const LabelsSelection = ({ org, repo: repoName, onChange }) => {
  const userContext = useContext(UserContext)
  const { repo, isLoading, error } = useRepo(org, repoName, userContext.token)
  if (isLoading) {
    return "loading repo.."
  }
  if (error) {
    return "error repo"
  }
  console.log(repo)
  return <LabelsList url={repo.labels_url} onChange={onChange} />
}

const TimelineSection = ({ org, repo }) => {
  const classes = useStyles()
  const [labels, setLabels] = useState([])

  const onLabelChange = (newLabels) => {
    setLabels(newLabels.map((l) => l.name))
  }

  return (
    <React.Fragment>
      <Grid container spacing={3} className={classes.container}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Timeline:
          </Typography>
          <Grid container spacing={3}>
            {(org && repo && (
              <Grid item xs={4}>
                <LabelsSelection
                  repo={repo}
                  org={org}
                  onChange={onLabelChange}
                />
              </Grid>
            )) || <Grid item xs={2} />}
            <Grid item xs={6}>
              {org && repo && labels && (
                <TimelineList org={org} repo={repo} labels={labels} />
              )}
            </Grid>
            <Grid item xs={2} />
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default TimelineSection
