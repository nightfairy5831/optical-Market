import axios, { AxiosRequestConfig } from 'axios'
import { getCurrentUserId } from '@/lib/user-context'

const Axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || '',
})

const getHeaders = () => {
  const userId = getCurrentUserId()
  return userId ? { 'x-user-id': userId } : {}
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
