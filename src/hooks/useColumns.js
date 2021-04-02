import useSWR from "swr"
import fetcher from "../fetcher"

const useColumns = (url, token) => {
  const { data, error } = useSWR([url, token], fetcher)
  return {
    columns: data,
    isLoading: !error && !data,
    error: error,
  }
}

export default useColumns
