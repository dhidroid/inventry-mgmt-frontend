import React from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Container, Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, 
  Category as ProductIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  TrendingUp as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

const DRAWER_WIDTH = 260;

interface Props {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const MainLayout: React.FC<Props> = ({ children, user, onLogout }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Daily Tracker', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Products', icon: <ProductIcon />, path: '/products' },
    { text: 'Categories', icon: <Box component="span" sx={{ fontSize: 20 }}>🏷️</Box>, path: '/categories' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  ];

  if (user.role === UserRole.ADMIN) {
    menuItems.push({ text: 'User Access', icon: <PeopleIcon />, path: '/users' });
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3 }}>
        <Box 
          sx={{ 
            width: 32, height: 32, borderRadius: 1, bgcolor: 'secondary.main', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', color: 'white'
          }}
        >
          O
        </Box>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          OmniStock
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ px: 2, pt: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>{user.name[0]}</Avatar>
          <Box overflow="hidden">
            <Typography variant="subtitle2" noWrap fontWeight="bold">{user.name}</Typography>
            <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>{user.role}</Typography>
          </Box>
        </Box>
        <ListItemButton 
          onClick={onLogout}
          sx={{ 
            borderRadius: 2, 
            color: '#ef9a9a',
            '&:hover': { bgcolor: 'rgba(244,67,54,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'primary.main' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box flexGrow={1} />
          
          <IconButton sx={{ color: 'text.secondary' }}>
            <SearchIcon />
          </IconButton>
          <IconButton sx={{ color: 'text.secondary' }}>
            <NotificationsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Container maxWidth="xl" disableGutters>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
