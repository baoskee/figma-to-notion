import { Client } from '@notionhq/client'
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'
import axios from 'axios'
import 'dotenv/config'

const FIGMA_SECRET = process.env.FIGMA_SECRET as string
const FIGMA_TEAM = process.env.FIGMA_TEAM
const NOTION_SECRET = process.env.NOTION_SECRET
const NOTION_TARGET = process.env.NOTION_TARGET as string

const FIGMA_API_CONF = {
  headers: { ['X-FIGMA-TOKEN']: FIGMA_SECRET },
}

const notion = new Client({ auth: NOTION_SECRET })

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

const figmaFileToPage = (projectName: string, file: File) => ({
  Name: {
    type: 'title',
    title: [{ type: 'text', text: { content: file.name } }],
  },
  Project: {
    select: {
      name: projectName,
    },
  },
  'Figma URL': {
    url: `https://www.figma.com/file/${file.key}`,
  },
  'Last modified': {
    date: { start: file.last_modified },
  },
  // TODO: Include thumbnail URL
})

const lastParam = (url: string): string => {
  const tokens = url.split('/')
  return tokens[tokens.length - 1]
}

const fetchTablePages = async (
  tableId: string,
  nextCursor?: string
): Promise<QueryDatabaseResponse['results']> => {
  const res = await notion.databases.query({
    database_id: tableId,
    start_cursor: nextCursor,
  })
  if (res.has_more)
    return {
      ...res.results,
      ...(await fetchTablePages(tableId, res.next_cursor!)),
    }

  return res.results
}

const main = async () => {
  // Get all team's projects
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
  const pages = await fetchTablePages(NOTION_TARGET)

  // Map of Figma key to Notion page, but sourced from existing
  // pages in Notion table
  const notionPageTable: Map<string, string> = pages.reduce((m, page) => {
    const figmaFileKey = lastParam(page['properties']['Figma URL'].url)
    m.set(figmaFileKey, page.id)
    return m
  }, new Map())

  // Remove pages that were deleted from Figma, Notion key set - Figma key set
  const figmaKeysFromNotion = [...notionPageTable.keys()]
  const figmaKeys = new Set(
    allFiles
      .map(proj => proj.files)
      .flat()
      .map(f => f.key)
  )

  // MARK: Delete Notion pages that are no longer in Figma
  for (let key of figmaKeysFromNotion.filter(k => !figmaKeys.has(k))) {
    await notion.pages.update({
      page_id: notionPageTable.get(key)!,
      archived: true,
    })
  }

  // MARK: Update or insert files from Figma to Notion
  for (let project of allFiles) {
    for (let file of project.files) {
      // Update existing Notion page if found
      if (notionPageTable.has(file.key)) {
        await notion.pages.update({
          page_id: notionPageTable.get(file.key)!,
          cover: {
            external: { url: file.thumbnail_url },
          },
          // @ts-ignore
          properties: figmaFileToPage(project.name, file),
        })
        continue
      }

      // Create if not found
      await notion.pages.create({
        parent: { database_id: NOTION_TARGET },
        cover: {
          external: { url: file.thumbnail_url },
        },
        // @ts-ignore
        properties: figmaFileToPage(project.name, file),
      })
    }
  }
}

main()

export default main
