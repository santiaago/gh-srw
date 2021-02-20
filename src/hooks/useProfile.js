import fetcher from "../fetcher"
import useSWR from "swr"

const useProfile = (token) => {
  const { data, error } = useSWR(
    ["https://api.github.com/user", token],
    fetcher
  )
  return {
    user: data,
    isLoading: !error && !data,
    error: error,
  }
}

export default useProfile
