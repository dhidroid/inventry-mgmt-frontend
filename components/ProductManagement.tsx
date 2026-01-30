import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { DataGrid, GridColDef, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Typography, Paper, Alert, Snackbar 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiService } from '../services/apiService';

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  isAdmin: boolean;
}

const ProductManagement: React.FC<Props> = ({ products, setProducts, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false, message: '', severity: 'success'
  });
  
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    unit: '70pc',
    capacity: 100,
    category: 'General'
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({ code: '', name: '', unit: '70pc', capacity: 100, category: 'General' });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        const updated = await apiService.updateProduct(editingId, formData);
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        const created = await apiService.addProduct(formData);
        setProducts(prev => [...prev, created]);
        setSnackbar({ open: true, message: 'Product created successfully', severity: 'success' });
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
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSnackbar({ open: true, message: 'Product deleted', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Product Name', flex: 1 },
    { field: 'unit', headerName: 'Unit', width: 120 },
    { field: 'capacity', headerName: 'Capacity', type: 'number', width: 100 },
    { field: 'category', headerName: 'Category', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: ({ id }) => {
        if (!isAdmin) return [];
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleOpen(products.find(p => p.id === id))}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(id as string)}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Master Product Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage item specifications
          </Typography>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
          >
            Add Item
          </Button>
        )}
      </Box>

      <Paper elevation={2} sx={{ height: '100%' }}>
        <DataGrid
          rows={products}
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
        <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Box display="flex" gap={2}>
              <TextField 
                label="Item Code" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})} 
                fullWidth 
                required 
              />
              <TextField 
                label="Capacity" 
                type="number" 
                value={formData.capacity} 
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} 
                fullWidth 
                required 
              />
            </Box>
            <TextField 
              label="Product Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              fullWidth 
              required 
            />
            <Box display="flex" gap={2}>
              <TextField 
                label="Unit Size" 
                value={formData.unit} 
                onChange={e => setFormData({...formData, unit: e.target.value})} 
                fullWidth 
              />
              <TextField 
                select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save Item'}
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

export default ProductManagement;
