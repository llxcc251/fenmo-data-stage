import { create } from 'zustand'

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
      const [plays, roles, melodies, relations] = await Promise.all([
        fetch('/src/data/plays.json').then(r => r.json()),
        fetch('/src/data/roles.json').then(r => r.json()),
        fetch('/src/data/melodies.json').then(r => r.json()),
        fetch('/src/data/relations.json').then(r => r.json()),
      ])
      set({ plays, roles, melodies, relations, loaded: true, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },
}))

export default useStore
