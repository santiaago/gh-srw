import useSWR from "swr"
import fetcher from "../fetcher"
const useRepo = (org, repo, token) => {
  const { data, error } = useSWR(
    [`https://api.github.com/repos/${org}/${repo}`, token],
    fetcher
  )
  return {
    repo: data,
    isLoading: !error && !data,
    error: error,
  }
}

export default useRepo
