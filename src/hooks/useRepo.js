import useSWR from "swr"
import fetcher from "../fetcher"
const useRepo = (owner, repo, token) => {
  const { data, error } = useSWR(
    [`https://api.github.com/repos/${owner}/${repo}`, token],
    fetcher
  )
  return {
    repo: data,
    isLoading: !error && !data,
    error: error,
  }
}

export default useRepo
