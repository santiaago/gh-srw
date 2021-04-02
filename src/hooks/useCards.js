import useSWR from "swr"
import fetcher from "../fetcher"

const useCards = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    cards: data,
    isLoading: !error && !data,
    error: error,
  }
}

export default useCards
