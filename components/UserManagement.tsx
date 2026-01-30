
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/apiService';
import { DataGrid, GridColDef, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Typography, Paper, Alert, Snackbar, Chip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false, message: '', severity: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF,
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', role: UserRole.STAFF, password: '' });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) { // Update existing user
        const updated = await apiService.updateUser(editingId, formData);
        setUsers(prev => prev.map(u => u.id === editingId ? updated : u));
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else { // Create new user
        const newUser = await apiService.createUser(formData);
        setUsers(prev => [...prev, newUser]);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      handleClose();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          icon={<SecurityIcon />} 
          label={params.value} 
          color={params.value === UserRole.ADMIN ? 'primary' : 'default'} 
          size="small" 
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpen(users.find(u => u.id === id))}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(id as string)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            User Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee accounts and permissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
        >
          Add New User
        </Button>
      </Box>

      <Paper elevation={2} sx={{ height: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit User' : 'New User Account'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField 
              label="Full Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              fullWidth 
              required 
            />
            <TextField 
              label="Email" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              fullWidth 
              required 
            />
            <Box display="flex" gap={2}>
              <TextField 
                label="Role" 
                select 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value as UserRole})} 
                fullWidth
              >
                <MenuItem value={UserRole.STAFF}>Staff</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              </TextField>
              <TextField 
                label={editingId ? "New Password (Optional)" : "Password"} 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                fullWidth 
                required={!editingId}
                placeholder={editingId ? "Leave blank to keep current" : ""}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={loading}>
            {loading ? 'Saving...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;

