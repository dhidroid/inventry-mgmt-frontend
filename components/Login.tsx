
import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { 
  Box, Button, Container, TextField, Typography, Paper, Alert, CircularProgress, 
  InputAdornment, IconButton 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface Props {
  onLogin: (user: User, token?: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.login({ email, password });
      onLogin(data.user, data.token);
    } catch (err) {
      setError('Invalid credentials. Please contact your administrator.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        p: 2
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={24} 
          sx={{ 
            p: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 4,
            width: '100%'
          }}
        >
          <Box 
            sx={{ 
              m: 1, 
              bgcolor: 'secondary.main', 
              color: 'white', 
              p: 2, 
              borderRadius: '20px',
              mb: 3,
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>
          <Typography component="h1" variant="h4" fontWeight="800" gutterBottom color="primary">
            OmniStock
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4} textAlign="center">
            Secure Enterprise Gateway
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Enterprise ID / Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Authenticate System'}
            </Button>
            
            <Box mt={4} textAlign="center">
              <Typography variant="caption" display="block" color="text.disabled">
                Protected by OmniGuard™ Security
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

