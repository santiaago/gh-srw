import useSWR from "swr"
import fetcher from "../fetcher"

const useCardInfo = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    info: data,
    isLoading: !error && !data,
    error: error,
  }
}

export default useCardInfo
