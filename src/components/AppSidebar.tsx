import { LayoutDashboard, Package, Hash, Ban, User } from "lucide-react";
import nexusLogo from "@/assets/Nexus.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Visão Geral", url: "/", icon: LayoutDashboard },
  { title: "Pacotes", url: "/pacotes", icon: Package },
  { title: "Part Numbers", url: "/part-numbers", icon: Hash },
  { title: "Cancelados", url: "/cancelados", icon: Ban },
  { title: "Perfil", url: "/perfil", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img src={nexusLogo} alt="NEXUS" className="h-8 w-8 rounded-lg object-contain" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">NEXUS</h2>
              <p className="text-xs text-muted-foreground">Sourcing Control</p>
            </div>
          </div>
        ) : (
          <img src={nexusLogo} alt="NEXUS" className="h-8 w-8 rounded-lg object-contain mx-auto" />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/50 transition-colors duration-150"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
