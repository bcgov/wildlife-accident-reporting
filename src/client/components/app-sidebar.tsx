import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '@/components/ui/sidebar'

const FILTER_GROUPS = [
  'Year',
  'Species',
  'Service Area',
  'Sex',
  'Time of Kill',
  'Age',
  'Date Range',
] as const

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <span className="text-lg font-semibold px-2">Filters</span>
      </SidebarHeader>
      <SidebarContent>
        {FILTER_GROUPS.map((group) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <p className="px-2 text-xs text-muted-foreground">
                {group} filter placeholder
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 text-xs text-muted-foreground">
          0 observations match current filters
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
