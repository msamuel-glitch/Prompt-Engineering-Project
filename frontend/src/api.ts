// Types come from the backend's OpenAPI schema: run `npm run api:types` with
// the backend running after changing backend/app/schemas.py.
import type { components } from './api-schema'

export type StoredSheet = components['schemas']['StoredSheet']
export type SheetSummary = components['schemas']['SheetSummary']
export type StudySheet = components['schemas']['StudySheet']
export type Section = components['schemas']['Section']
export type SourceType = StoredSheet['source_type']
export type PastePrompt = components['schemas']['PastePrompt']

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (response.status === 204) {
    return undefined as T
  }
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      typeof body?.detail === 'string'
        ? body.detail
        : `The server did not answer (error ${response.status}). Is the backend running?`,
    )
  }
  return body as T
}

function sending(body: unknown): RequestInit {
  return {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

/** Upload a course; the sheet is generated and saved. */
export async function generateSheet(file: File): Promise<StoredSheet> {
  const form = new FormData()
  form.append('file', file)
  return request<StoredSheet>('/api/sheets', { method: 'POST', body: form })
}

/** Free copy-paste mode, step 1: the prompt to run on claude.ai. */
export async function preparePrompt(file: File): Promise<PastePrompt> {
  const form = new FormData()
  form.append('file', file)
  return request<PastePrompt>('/api/sheets/prompt', { method: 'POST', body: form })
}

/** Free copy-paste mode, step 2: save the sheet from Claude's pasted answer. */
export async function importSheet(
  file: File,
  answer: string,
  promptVersion: string,
): Promise<StoredSheet> {
  const form = new FormData()
  form.append('file', file)
  form.append('answer', answer)
  form.append('prompt_version', promptVersion)
  return request<StoredSheet>('/api/sheets/import', { method: 'POST', body: form })
}

/** The library, newest first, optionally narrowed to one subject tag. */
export async function listSheets(tag?: string): Promise<SheetSummary[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : ''
  return request<SheetSummary[]>(`/api/sheets${query}`)
}

export async function readSheet(id: string): Promise<StoredSheet> {
  return request<StoredSheet>(`/api/sheets/${id}`)
}

/** Save the student's version; the version the AI wrote is kept aside. */
export async function saveSheet(id: string, sheet: StudySheet): Promise<StoredSheet> {
  return request<StoredSheet>(`/api/sheets/${id}/sheet`, sending(sheet))
}

/** Undo every edit by putting the AI version back. */
export async function restoreSheet(id: string): Promise<StoredSheet> {
  return request<StoredSheet>(`/api/sheets/${id}/restore`, { method: 'POST' })
}

export async function setTags(id: string, tags: string[]): Promise<StoredSheet> {
  return request<StoredSheet>(`/api/sheets/${id}/tags`, sending({ tags }))
}

/** File a sheet in a folder; an empty name takes it back out. */
export async function moveSheet(id: string, folder: string): Promise<StoredSheet> {
  return request<StoredSheet>(`/api/sheets/${id}/folder`, sending({ folder }))
}

export async function listFolders(): Promise<string[]> {
  return request<string[]>('/api/folders')
}

export async function deleteSheet(id: string): Promise<void> {
  return request<void>(`/api/sheets/${id}`, { method: 'DELETE' })
}
