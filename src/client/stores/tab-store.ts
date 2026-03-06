import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type TabState = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const useTabStore = create<TabState>()(
  devtools(
    (set) => ({
      activeTab: 'map',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    { name: 'tab-store' },
  ),
)
