import axios from 'axios'
import 'dotenv/config'

const FIGMA_SECRET = process.env.FIGMA_SECRET as string
const FIGMA_TEAM = process.env.FIGMA_TEAM
const NOTION_SECRET = process.env.NOTION_SECRET
const NOTION_TARGET = process.env.NOTION_TARGET

const FIGMA_API_CONF = {
  headers: { ['X-FIGMA-TOKEN']: FIGMA_SECRET },
}

type Team = {
  name: string
  projects: Array<{
    id: string
    name: string
  }>
}

type File = {
  key: string
  name: string
  thumbnail_url: string
  last_modified: string
}

const main = async () => {
  const res = await axios.get(
    `https://api.figma.com/v1/teams/${FIGMA_TEAM}/projects`,
    FIGMA_API_CONF
  )

  const teamData: Team = res.data
  const projectFilesRes = await Promise.all(
    teamData.projects.map((proj) =>
      axios.get(
        `https://api.figma.com/v1/projects/${proj.id}/files`,
        FIGMA_API_CONF
      )
    )
  )

  const allFiles: { name: string; files: File[] }[] = projectFilesRes.map(
    (o) => o.data
  )
}

main()

export default main
