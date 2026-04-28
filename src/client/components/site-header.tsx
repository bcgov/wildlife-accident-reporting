import { BarChart3 as BarChartIcon, Map as MapIcon } from 'lucide-react'
import bcidSymbol from '@/assets/images/bcid-symbol.svg'
import bcidSymbolRev from '@/assets/images/bcid-symbol-rev.svg'
import { ModeToggle } from '@/components/mode-toggle'
import { SearchAddress } from '@/components/search-address'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserMenu } from '@/components/user-menu'

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-50 w-full">
      <div
        aria-hidden="true"
        className="h-2 w-full border-b-4 border-gold-100 bg-blue-100"
      />
      <header className="flex w-full items-center border-b bg-background">
        <div className="flex h-(--header-height) w-full items-center gap-4 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6! self-center!" />

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center md:flex">
              <img
                src={bcidSymbol}
                alt=""
                aria-hidden="true"
                className="block h-8 w-auto dark:hidden"
              />
              <img
                src={bcidSymbolRev}
                alt=""
                aria-hidden="true"
                className="hidden h-8 w-auto dark:block"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold">WISR</span>
              <span className="hidden text-xs text-muted-foreground md:inline">
                Wildlife Incident Safety Reporting
              </span>
            </div>
          </div>

          <TabsList variant="line" className="ml-2 self-stretch">
            <TabsTrigger value="map">
              <MapIcon />
              Map
            </TabsTrigger>
            <TabsTrigger value="data">
              <BarChartIcon />
              Data
            </TabsTrigger>
          </TabsList>

          <SearchAddress />

          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <div className="hidden md:block">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
