const fetcher = async (path, token) => {
  const res = await fetch(path, {
    headers: {
      Authorization: `token ${token}`,
      // Accept: `application/vnd.github.starfox-preview+json`,
      //Accept: "application/vnd.github.v3.full+json",
      Accept: "application/vnd.github.inertia-preview+json",
    },
  })
  if (!res.ok) {
    const error = new Error(`${path} :: ${res.status}`)
    error.info = await res.json()
    error.status = res.status
    console.error("sending err", error)
    throw error
  }
  return res.json()
}

export default fetcher
