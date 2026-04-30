import type { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(
  response: Response,
  schema?: z.ZodType<T>,
): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().login(window.location.href)
    }
    let message = `Request failed: ${response.statusText}`
    let errorData: unknown

    try {
      errorData = await response.json()
      if (
        typeof errorData === 'object' &&
        errorData !== null &&
        ('message' in errorData || 'error' in errorData)
      ) {
        const data = errorData as { message?: string; error?: string }
        message = data.message || data.error || message
      }
    } catch {}

    throw new ApiError(message, response.status, errorData)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json()

  if (schema) {
    const result = schema.safeParse(json)
    if (!result.success) {
      console.error(
        'API response failed schema validation:',
        result.error.issues,
      )
      throw new ApiError(
        'Invalid response format from server',
        response.status,
        result.error.issues,
      )
    }
    return result.data
  }

  return json as T
}

function authHeaders(): HeadersInit {
  const token = useAuthStore.getState().getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const apiClient = {
  get: <T>(path: string, schema?: z.ZodType<T>): Promise<T> =>
    fetch(path, { headers: authHeaders() }).then((r) =>
      handleResponse<T>(r, schema),
    ),

  post: <T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> =>
    fetch(path, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r, schema)),

  put: <T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> =>
    fetch(path, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r, schema)),

  patch: <T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> =>
    fetch(path, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r, schema)),

  delete: <T>(path: string, schema?: z.ZodType<T>): Promise<T> =>
    fetch(path, { method: 'DELETE', headers: authHeaders() }).then((r) =>
      handleResponse<T>(r, schema),
    ),

  deleteWithBody: <T>(
    path: string,
    body: unknown,
    schema?: z.ZodType<T>,
  ): Promise<T> =>
    fetch(path, {
      method: 'DELETE',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r, schema)),
}
