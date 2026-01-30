import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { apiService } from '../services/apiService';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Typography, Paper, Alert, Snackbar, List, ListItem, 
  ListItemText, IconButton, Divider 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false, message: '', severity: 'success'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!newCategory.name) return;
    setLoading(true);
    try {
      const created = await apiService.createCategory(newCategory);
      setCategories([...categories, created]);
      setSnackbar({ open: true, message: 'Category created', severity: 'success' });
      setOpen(false);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create category', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      setSnackbar({ open: true, message: 'Category deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="700">Category Management</Typography>
          <Typography variant="body2" color="text.secondary">Organize your inventory classifications</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          New Category
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <List>
          {categories.map((cat, index) => (
            <React.Fragment key={cat.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(cat.id)}>
                    <DeleteIcon color="action" />
                  </IconButton>
                }
              >
                <Box mr={2} color="primary.main"><FolderIcon /></Box>
                <ListItemText 
                  primary={<Typography fontWeight="600">{cat.name}</Typography>} 
                  secondary={cat.description} 
                />
              </ListItem>
              {index < categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {categories.length === 0 && (
            <Box p={4} textAlign="center" color="text.secondary">
              No categories found. Create one to get started.
            </Box>
          )}
        </List>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight="700">Add Category</DialogTitle>
        <DialogContent>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Category Name"
              fullWidth
              autoFocus
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={2}
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading || !newCategory.name}>
            {loading ? 'Saving...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement;
