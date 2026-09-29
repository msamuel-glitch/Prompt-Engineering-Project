// Types come from the backend's OpenAPI schema: run `npm run api:types` with
// the backend running after changing backend/app/schemas.py.
import type { components } from './api-schema'

export type StudySheetResponse = components['schemas']['StudySheetResponse']
export type SourceType = StudySheetResponse['source_type']
export type StudySheet = StudySheetResponse['sheet']

export async function generateSheet(file: File): Promise<StudySheetResponse> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch('/api/sheets', { method: 'POST', body: form })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      typeof body?.detail === 'string'
        ? body.detail
        : `The server did not answer (error ${response.status}). Is the backend running?`,
    )
  }
  return body as StudySheetResponse
}
