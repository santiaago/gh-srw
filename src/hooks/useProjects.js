import useSWR from "swr"
import fetcher from "../fetcher"

const useProjects = (org, repo, token) => {
  const { data, error } = useSWR(
    [`https://api.github.com/repos/${org}/${repo}/projects?state=open`, token],
    fetcher
  )
  return {
    projects: data,
    isLoading: !error && !data,
    error: error,
  }
}

export default useProjects
