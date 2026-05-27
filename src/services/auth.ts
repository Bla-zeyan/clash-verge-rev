const API_BASE = 'https://vdev.dv333.online'

export interface LoginRequest {
  username: string
  password: string
  DeviceIMEI?: string
}

export interface UserInfo {
  id: number
  status: number
  class: number
  level: number
  expire_in: string
  invite_code: string
  link: string
  usedTraffic: string
  Traffic: string
  vip_type: string
  nodes: unknown[]
}

export interface LoginResponse {
  status: 'success' | 'fail'
  message: string
  data: UserInfo
}

export interface NodeInfo {
  name: string
  server: string
  server_port: string
  password: string
  method: string
  obfs?: string
  obfsparam?: string
  protocol?: string
  protocolparam?: string
  single: number
  flags?: string
  group?: string
  vip_type?: string
  is_default?: number
}

export interface CountryGroup {
  country_code: string
  country_name: string
  country_flag: string
  nodes: NodeInfo[]
}

export interface GetNodeListResponse {
  status: 'success' | 'fail'
  data: CountryGroup[]
}

const AUTH_USER_ID_KEY = 'auth_user_id'

export const auth = {
  login: async (params: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return res.json()
  },

  getNodeList: async (userId: number): Promise<GetNodeListResponse> => {
    const res = await fetch(`${API_BASE}/api/getNodeList`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserID: userId }),
    })
    return res.json()
  },

  saveUserId: (id: number) => {
    localStorage.setItem(AUTH_USER_ID_KEY, String(id))
  },

  getUserId: (): number | null => {
    const id = localStorage.getItem(AUTH_USER_ID_KEY)
    return id ? Number(id) : null
  },

  clearAuth: () => {
    localStorage.removeItem(AUTH_USER_ID_KEY)
  },
}
