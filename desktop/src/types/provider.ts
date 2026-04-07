// desktop/src/types/provider.ts

export type ModelMapping = {
  main: string
  haiku: string
  sonnet: string
  opus: string
}

export type SavedProvider = {
  id: string
  presetId: string
  name: string
  apiKey: string  // masked from server
  baseUrl: string
  models: ModelMapping
  notes?: string
}

export type CreateProviderInput = {
  presetId: string
  name: string
  apiKey: string
  baseUrl: string
  models: ModelMapping
  notes?: string
}

export type UpdateProviderInput = {
  name?: string
  apiKey?: string
  baseUrl?: string
  models?: ModelMapping
  notes?: string
}

export type TestProviderConfigInput = {
  baseUrl: string
  apiKey: string
  modelId: string
}

export type ProviderTestResult = {
  success: boolean
  latencyMs: number
  error?: string
  modelUsed?: string
  httpStatus?: number
}
