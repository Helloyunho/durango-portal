export enum RegistryKind {
  NONE = 0,
  STRING = 1,
  EXPANDABLE_STRING = 2,
  BINARY = 3,
  DWORD = 4,
  MULTI_STRING = 7,
  QWORD = 11
}

export const kindToString = (kind: RegistryKind) => {
  switch (kind) {
    case RegistryKind.NONE:
      return 'None'
    case RegistryKind.STRING:
      return 'String'
    case RegistryKind.EXPANDABLE_STRING:
      return 'Expandable String'
    case RegistryKind.BINARY:
      return 'Binary'
    case RegistryKind.DWORD:
      return 'DWORD'
    case RegistryKind.MULTI_STRING:
      return 'Multi-String'
    case RegistryKind.QWORD:
      return 'QWORD'
    default:
      return 'Unknown'
  }
}

export interface RegistryValue {
  key: string
  kind: RegistryKind
  value: string | number | string[] | number[]
}

export interface Registry {
  [key: string]: Registry | null
}
