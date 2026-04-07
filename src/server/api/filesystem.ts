/**
 * Filesystem browser & search API — supports directory browsing and file search
 * for the DirectoryPicker component and @-triggered file search popup.
 */

import * as path from 'path'
import * as fs from 'fs'

export async function handleFilesystemRoute(pathname: string, url: URL): Promise<Response> {
  if (pathname === '/api/filesystem/browse') {
    return handleBrowse(url)
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
}

async function handleBrowse(url: URL): Promise<Response> {
  const targetPath = url.searchParams.get('path') || process.env.HOME || '/'
  const resolvedPath = path.resolve(targetPath)
  const searchQuery = url.searchParams.get('search') || ''
  const includeFiles = url.searchParams.get('includeFiles') === 'true'
  const maxResults = Math.min(parseInt(url.searchParams.get('maxResults') || '200', 10), 200)

  try {
    const stat = fs.statSync(resolvedPath)
    if (!stat.isDirectory()) {
      return json({ error: 'Not a directory', path: resolvedPath }, 400)
    }

    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true })

    if (searchQuery) {
      // Search mode: filter by filename, include both dirs and files
      const query = searchQuery.toLowerCase()
      const results = entries
        .filter((e) => {
          if (e.name.startsWith('.')) return false
          if (e.isDirectory()) return e.name.toLowerCase().includes(query)
          if (!includeFiles) return false
          return e.name.toLowerCase().includes(query)
        })
        .slice(0, maxResults)
        .map((e) => ({
          name: e.name,
          path: path.join(resolvedPath, e.name),
          isDirectory: e.isDirectory(),
        }))
        .sort((a, b) => {
          // Directories first, then alphabetically
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
          return a.name.localeCompare(b.name)
        })

      return json({
        currentPath: resolvedPath,
        parentPath: path.dirname(resolvedPath),
        entries: results,
        query: searchQuery,
      })
    }

    // Browse mode: show all directories (and optionally files)
    const filtered = entries.filter((e) => {
      if (e.name.startsWith('.')) return false
      if (e.isDirectory()) return true
      return includeFiles
    })

    const entries_list = filtered
      .map((e) => ({
        name: e.name,
        path: path.join(resolvedPath, e.name),
        isDirectory: e.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.name.localeCompare(b.name)
      })

    return json({
      currentPath: resolvedPath,
      parentPath: path.dirname(resolvedPath),
      entries: entries_list,
    })
  } catch (err) {
    return json({ error: `Cannot read directory: ${err}`, path: resolvedPath }, 500)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
