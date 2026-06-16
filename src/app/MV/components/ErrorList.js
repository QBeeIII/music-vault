export function ErrorList({list})
{
  const jsxList = list.map((error,index) => <li key={index}>{error}</li>)
  return (
    <ul>
      {jsxList}
    </ul>
  )
}