# Introduction

FigJam to Notion compiler. The purpose of this project is to do

Currently, it is not possible to obtain all the team IDs of a user
programmatically. Figjam file hierarchy:

- Team
- Projects
- Files

# Design

Attributes to Notion: title (text), project (tag), Figma URL (URL),
last modified (in Figma), key (text). The last attribute is to sync your Figma files
and update their other attributes without misplacing it; the key is also
used to generate the Figma URL.

The Notion table can add additional decorator columns.
Post-compilation can change text and project and will not replace Notion
decorated data.

# Getting Started

In your .env file, make sure that the variables are populated

- `FIGMA_SECRET` - Access token to your Figma workspaces
- `FIGMA_TEAM` - The ID for Figma team you want to compile files to
- `NOTION_SECRET` - The Notion secret to workspace you want to compile to
- `NOTION_TABLE` - The ID of database target to inject your Figma files
