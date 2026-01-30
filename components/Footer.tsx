
import React from 'react';
import { Box, Container, Typography, Stack, IconButton, Divider } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
// Removed LinkedIn imports and link as requested

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto', 
        py: 4, 
        px: 2, 
        bgcolor: 'background.paper', 
        borderTop: '1px solid', 
        borderColor: 'divider',
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          alignItems="center" 
          justifyContent="space-between" 
          spacing={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'secondary.main', boxShadow: '0 0 10px rgba(139,92,246,0.5)' }} />
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              Created and developed by{' '}
              <Typography component="span" color="primary" fontWeight="bold">
                Dhineshkumar
              </Typography>
              <Box component="span" sx={{ ml: 0.5, color: 'secondary.main', verticalAlign: 'middle' }}>
                <FavoriteIcon fontSize="small" />
              </Box>
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={4}>
            {/* LinkedIn removed */}
            
            <Box display={{ xs: 'none', sm: 'flex' }} flexDirection="column" alignItems="flex-end">
              <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 3, fontWeight: 900, mb: 0.5 }}>
                OmniStock Enterprise v2.0
              </Typography>
              <Box sx={{ height: 2, width: 48, bgcolor: 'primary.light', borderRadius: 1 }} />
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
