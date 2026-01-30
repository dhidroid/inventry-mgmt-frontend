
import React, { useState, useMemo, useRef } from 'react';
import { Product, InventoryEntry, User } from '../types';
import { Search, Download, FileText, Camera, Save, Plus, X, Loader2, Filter, SlidersHorizontal } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../services/exportService';
import { geminiService } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { 
  Box, Typography, Button, TextField, InputAdornment, IconButton, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Chip, Grid, Stack, CircularProgress, Tooltip
} from '@mui/material';

interface Props {
  products: Product[];
  entries: InventoryEntry[];
  setEntries: React.Dispatch<React.SetStateAction<InventoryEntry[]>>;
  user: User;
}

const InventoryTracker: React.FC<Props> = ({ products, entries, setEntries, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse dates safely from API
  const normalizeValues = (data: InventoryEntry[]) => {
    return data.map(e => {
      // Parse the date string/object into a Local Date
      const d = new Date(e.date);
      // Extract local YYYY-MM-DD
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      
      return {
        ...e,
        date: `${yyyy}-${mm}-${dd}`
      };
    });
  };

  React.useEffect(() => {
    if (entries.length > 0) {
      // Ensure initial entries are normalized if they came from props
      setEntries(prev => normalizeValues(prev));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [manualEntry, setManualEntry] = useState<{show: boolean, productId?: string, date?: string}>({show: false});
  const [newCount, setNewCount] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  const dates = useMemo(() => {
    const arr: string[] = [];
    const [year, month] = selectedMonth.split('-').map(Number);
    for (let i = 1; i <= daysInMonth; i++) {
      // Create date in local time
      const d = new Date(year, month - 1, i);
      // Construct YYYY-MM-DD manually to respect local time and avoid UTC shift
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      arr.push(`${yyyy}-${mm}-${dd}`);
    }
    return arr;
  }, [daysInMonth, selectedMonth]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search term check (SKU or Name)
      const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Category check
      const matchesCategory = categoryFilter === '' || p.category === categoryFilter;
      
      // 3. Stock range check (using the latest available count for the product)
      const productEntries = entries
        .filter(e => e.productId === p.id)
        .sort((a, b) => b.date.localeCompare(a.date));
      const latestCount = productEntries.length > 0 ? productEntries[0].count : 0;
      
      const min = minStock === '' ? -Infinity : parseInt(minStock);
      const max = maxStock === '' ? Infinity : parseInt(maxStock);
      const matchesStock = latestCount >= min && latestCount <= max;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, entries, searchTerm, categoryFilter, minStock, maxStock]);

  const handleEntryChange = (productId: string, date: string, count: string) => {
    const num = parseInt(count) || 0;
    setEntries(prev => {
      const others = prev.filter(e => !(e.productId === productId && e.date === date));
      return [...others, {
        id: Math.random().toString(36).substr(2, 9),
        productId,
        date,
        count: num,
        userId: user.id
      }];
    });
    setHasUnsavedChanges(true);
  };

  const saveAllToBackend = async () => {
    setIsSaving(true);
    try {
      await apiService.saveEntries(entries);
      
      // Re-fetch to confirm data is saved and update UI with server state
      const freshEntries = await apiService.getEntries();
      setEntries(normalizeValues(freshEntries));
      
      setHasUnsavedChanges(false);
      alert("All records synced and verified!");
    } catch (err: any) {
      alert("Sync failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getEntryValue = (productId: string, date: string) => {
    return entries.find(e => e.productId === productId && e.date === date)?.count || '';
  };

  const handleExportExcel = () => {
    const reportData = filteredProducts.map(p => {
      // Explicitly order columns: Code, Name, Category, then Days
      const row: any = { 
        Code: p.code, 
        Name: p.name, 
        Category: p.category 
        // Capacity removed as per user request for "code, name, category, days"
      };
      
      dates.forEach(d => {
        // Format day header as just the day number (e.g., "01", "02")
        // This aligns with "monthly based" reporting
        const dayHeader = d.split('-')[2]; 
        row[dayHeader] = getEntryValue(p.id, d);
      });
      return row;
    });
    exportToExcel(reportData, `Inventory_Report_${selectedMonth}`);
  };

  const handleManualEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualEntry.productId && manualEntry.date) {
      handleEntryChange(manualEntry.productId, manualEntry.date, newCount);
      setManualEntry({show: false});
      setNewCount('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await geminiService.extractInventoryFromImage(base64);
        
        if (result.extractions && Array.isArray(result.extractions)) {
          result.extractions.forEach((item: any) => {
            const product = products.find(p => p.code === item.productCode);
            if (product && item.date) {
              handleEntryChange(product.id, item.date, item.count.toString());
            }
          });
          alert("AI Extraction complete. Entries updated locally.");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("AI Scan failed:", err);
      alert("AI analysis failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setMinStock('');
    setMaxStock('');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="700" color="text.primary">
            Daily Inventory Hub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time tracking of movement and capacity
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{display: 'none'}} accept="image/*" />
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
          >
            AI Scan
          </Button>

          <Button 
            variant="contained" 
            startIcon={isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            onClick={saveAllToBackend}
            disabled={isSaving}
            color={hasUnsavedChanges ? "warning" : "primary"}
            sx={{ borderRadius: 2 }}
          >
            {isSaving ? 'Syncing...' : hasUnsavedChanges ? 'Save Changes' : 'Sync'}
          </Button>
          
          <Paper sx={{ display: 'flex' }}>
            <Tooltip title="Export Excel">
              <IconButton onClick={handleExportExcel} color="primary">
                <Download size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export PDF">
              <IconButton onClick={() => exportToPDF(products, entries, `Inventory Report - ${selectedMonth}`)} color="primary">
                <FileText size={20} />
              </IconButton>
            </Tooltip>
          </Paper>
        </Stack>
      </Box>

      <Paper sx={{ mb: 4, p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <TextField
              placeholder="Filter by SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            <Button 
              variant={showFilters ? "contained" : "outlined"}
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<Filter size={18} />}
              color="primary"
            >
              Filters
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setManualEntry({show: true, productId: filteredProducts[0]?.id, date: dates[0]})}
              startIcon={<Plus size={20} />}
            >
              Add Entry
            </Button>
          </Stack>
        </Stack>

        {showFilters && (
          <Box mt={3} p={2} bgcolor="background.default" borderRadius={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value=""><em>All Categories</em></MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField 
                    label="Min Stock" 
                    type="number" 
                    size="small" 
                    value={minStock} 
                    onChange={(e) => setMinStock(e.target.value)} 
                  />
                  <Typography variant="body2" color="text.secondary">to</Typography>
                  <TextField 
                    label="Max Stock" 
                    type="number" 
                    size="small" 
                    value={maxStock} 
                    onChange={(e) => setMaxStock(e.target.value)} 
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                 <Button color="error" fullWidth onClick={resetFilters}>Reset</Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper sx={{ height: '65vh', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table stickyHeader sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    position: 'sticky', left: 0, zIndex: 10, bgcolor: 'background.paper', 
                    fontWeight: 800, textTransform: 'uppercase', minWidth: 250, borderRight: '1px solid #e0e0e0'
                  }}
                >
                  Product Specifications
                </TableCell>
                {dates.map((date, idx) => (
                  <TableCell key={idx} align="center" sx={{ minWidth: 80, borderRight: '1px solid #f0f0f0' }}>
                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={700}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {date.split('-')[2]}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell 
                    sx={{ 
                      position: 'sticky', left: 0, zIndex: 5, bgcolor: 'background.paper', 
                      borderRight: '1px solid #e0e0e0'
                    }}
                  >
                    <Typography variant="caption" color="primary" fontWeight={800} fontFamily="monospace" display="block">
                      {p.code}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                      {p.name}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={0.5}>
                      <Chip label={p.unit} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      <Typography variant="caption" color="text.disabled">Max: {p.capacity}</Typography>
                    </Stack>
                  </TableCell>
                  {dates.map((date, idx) => (
                    <TableCell key={idx} padding="none" sx={{ borderRight: '1px solid #f0f0f0' }}>
                      <input 
                        type="text"
                        style={{
                          width: '100%', height: '60px', border: 'none', textAlign: 'center', 
                          background: 'transparent', outline: 'none', fontWeight: 600
                        }}
                        className="focus:bg-indigo-50"
                        value={getEntryValue(p.id, date)}
                        onChange={(e) => handleEntryChange(p.id, date, e.target.value)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={dates.length + 1} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No products found matching filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>


      <Dialog open={manualEntry.show} onClose={() => setManualEntry({show: false})} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="700">Quick Manual Entry</DialogTitle>
        <form onSubmit={handleManualEntrySubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Select Item</InputLabel>
                <Select
                  value={manualEntry.productId || ''}
                  label="Select Item"
                  onChange={e => setManualEntry({...manualEntry, productId: e.target.value})}
                >
                  {products.map(p => <MenuItem key={p.id} value={p.id}>{p.code} - {p.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={manualEntry.date || ''}
                onChange={e => setManualEntry({...manualEntry, date: e.target.value})}
              />
              <TextField
                label="Stock Count"
                type="number"
                fullWidth
                autoFocus
                value={newCount}
                onChange={e => setNewCount(e.target.value)}
                inputProps={{ style: { fontSize: '1.5rem', textAlign: 'center' } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setManualEntry({show: false})}>Cancel</Button>
            <Button type="submit" variant="contained" size="large">Confirm Entry</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InventoryTracker;
