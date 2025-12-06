import axios, { AxiosRequestConfig } from 'axios'

const Axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
})

const getHeaders = () => {
  if (typeof window !== 'undefined') {
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      const { state } = JSON.parse(authData)
      if (state?.token) {
        return { Authorization: `Bearer ${state.token}` }
      }
    }
  }
  return {}
}

const Request = {
  Get: async (url: string) => {
    return await Axios.get(url, { headers: getHeaders() }).then((res) => res.data)
  },
  Post: async (url: string, body?: any, options?: AxiosRequestConfig) => {
    return await Axios.post(url, body, { ...options, headers: { ...getHeaders(), ...options?.headers } }).then((res) => res.data)
  },
  Put: async (url: string, body: any) => {
    return await Axios.put(url, body, { headers: getHeaders() }).then((res) => res.data)
  },
  Delete: async (url: string, body?: any) => {
    return await Axios.delete(url, { data: body, headers: getHeaders() }).then((res) => res.data)
  },
}

export default Request
