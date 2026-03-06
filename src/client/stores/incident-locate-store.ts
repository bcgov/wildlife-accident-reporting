import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { IncidentProperties } from '@/features/map'

type LocateTarget = {
  coordinates: [number, number]
  properties: IncidentProperties
}

type IncidentLocateState = {
  target: LocateTarget | null
  locate: (target: LocateTarget) => void
  clear: () => void
}

export const useIncidentLocateStore = create<IncidentLocateState>()(
  devtools(
    (set) => ({
      target: null,
      locate: (target) => set({ target }),
      clear: () => set({ target: null }),
    }),
    { name: 'incident-locate-store' },
  ),
)
