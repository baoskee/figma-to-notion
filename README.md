# Introduction

Figma to Notion compiler (includes FigJam files). The purpose of this project is to view your Figma files and organize them through Notion
databases on top of their features: views, column decoration (tags, description, etc.), sorts, filters, ...

# Design

Currently, it is not possible to obtain all the team IDs of a user
programmatically, so you compile per Team ID. Figma file hierarchy:

- Team
- Projects
- Files

Attributes to Notion:

- File name (text)
- Project (tag)
- Figma URL (URL)
- Last modified (in Figma)

The Figma URL contains a `key` attribute in which you can identify the files. The URL is appended with the Figma File ID.

The Notion table can add additional decorator columns.
Post-compilation can change text and project and will not replace Notion decorated data.

# Getting Started

In your `.env` file, make sure that the variables are populated

- `FIGMA_SECRET` - Access token to your Figma workspaces
- `FIGMA_TEAM` - The ID for Figma team you want to compile files to
- `NOTION_SECRET` - The Notion secret to workspace you want to compile to
- `NOTION_TARGET` - The ID of database target to inject your Figma files

Run `yarn x` - to execute after populating the `.env` file.
