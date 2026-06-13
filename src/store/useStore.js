import { create } from 'zustand'

const API = '/api'

const useStore = create((set) => ({
  plays: [],
  roles: [],
  melodies: [],
  relations: [],
  loaded: false,
  loading: false,
  error: null,

  loadData: async () => {
    set({ loading: true, error: null })
    try {
      const [playsRes, rolesRes, melodiesRes, relationsRes] = await Promise.all([
        fetch(`${API}/plays?limit=9999`),
        fetch(`${API}/roles?limit=9999`),
        fetch(`${API}/melodies`),
        fetch(`${API}/relations`),
      ])
      if (!playsRes.ok) throw new Error('API not available')
      const [plays, roles, melodies, relations] = await Promise.all([
        playsRes.json(), rolesRes.json(), melodiesRes.json(), relationsRes.json()
      ])
      set({
        plays: plays.data || plays,
        roles: roles.data || roles,
        melodies: Array.isArray(melodies) ? melodies : [],
        relations: relations.data || relations,
        loaded: true,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },
}))

export default useStore
