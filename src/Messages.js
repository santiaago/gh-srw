export const Loading = ({ resource }) => {
  return <>loading {resource}...</>
}

export const Error = ({ resource, error }) => {
  return (
    <>
      failed to load {resource}, info:{error.info && error.info.message} status:
      {error.status} message:{error.message}
    </>
  )
}
