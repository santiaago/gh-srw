import React, { useContext } from "react"
import { useSWRInfinite } from "swr"
import fetcher from "./fetcher"
import UserContext from "./UserContext"

import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import TablePagination from "@material-ui/core/TablePagination"
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import { Typography } from "@material-ui/core"

const getIssuesKey = (pageIndex, previousPageData, owner, repo, token) => {
  if (previousPageData && !previousPageData.length) return null
  return [
    `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30&page=${
      pageIndex + 1
    }`,
    token,
  ]
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
}))

const Issues = ({ org, repo }) => {
  const classes = useStyles()
  const userContext = useContext(UserContext)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(30)
  const { data, size, setSize } = useSWRInfinite(
    (pi, ppd) => getIssuesKey(pi, ppd, org, repo, userContext.token),
    fetcher
  )

  let totalIssues = 0
  if (data) {
    console.log(data)
    for (let i = 0; i < data.length; i++) {
      totalIssues += data[i].length
    }
  }

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Github issues:
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <caption>opened issues list {totalIssues}</caption>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell align="left">Title</TableCell>
                  <TableCell align="right">State</TableCell>
                  <TableCell align="right">Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data &&
                  data.map((issues) =>
                    issues.map((i) => (
                      <TableRow key={i.node_id}>
                        <TableCell component="th" scope="row">
                          {i.number}
                        </TableCell>
                        <TableCell align="left">{i.title}</TableCell>
                        <TableCell align="right">{i.state}</TableCell>
                        <TableCell align="right">{i.created_at}</TableCell>
                      </TableRow>
                    ))
                  )}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>
                    <Button onClick={() => setSize(size + 1)} color="primary">
                      Load More
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default Issues
