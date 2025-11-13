import { create } from 'zustand'

type User = { sub: number; login: string; name?: string; avatarUrl?: string; email?: string }

type AuthState = {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clear: () => void
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('tap_token'),
  user: null,
  setAuth: (token, user) => { localStorage.setItem('tap_token', token); set({ token, user }) },
  clear: () => { localStorage.removeItem('tap_token'); set({ token: null, user: null }) },
}))

export function getAuthToken() { return localStorage.getItem('tap_token') }

