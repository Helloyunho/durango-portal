enum RegistryKind {
  NONE = 0,
  STRING = 1,
  EXPANDABLE_STRING = 2,
  BINARY = 3,
  DWORD = 4,
  MULTI_STRING = 7,
  QWORD = 11
}

export interface RegistryValue {
  key: string
  kind: RegistryKind
  value: string
}

export interface Registry {
  keys: Record<string, Registry> | null
  values: RegistryValue[]
}
