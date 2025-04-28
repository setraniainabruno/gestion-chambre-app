
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  BedDouble,
  CalendarRange,
  Users,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/tableau-de-bord',
    },
    {
      title: 'Chambres',
      icon: <BedDouble className="h-5 w-5" />,
      path: '/chambres',
    },
    {
      title: 'Réservations',
      icon: <CalendarRange className="h-5 w-5" />,
      path: '/reservations',
    },
    {
      title: 'Clients',
      icon: <Users className="h-5 w-5" />,
      path: '/clients',
    },
    {
      title: 'Rapports',
      icon: <FileBarChart className="h-5 w-5" />,
      path: '/rapports',
    },
    {
      title: 'Paramètres',
      icon: <Settings className="h-5 w-5" />,
      path: '/parametres',
    },
  ];

  return (
    <div
      className={cn(
        "bg-sidebar h-screen flex flex-col border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h1 className="text-sidebar-foreground font-bold text-xl">Gestion Chambres</h1>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pt-5">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sidebar-foreground rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              {item.icon}
              {!isCollapsed && <span className="ml-3">{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-white">
              {user?.prenom?.charAt(0).toLocaleUpperCase()}{user?.nom?.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-sidebar-foreground opacity-70">
                {user?.role}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
