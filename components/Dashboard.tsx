
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Product, InventoryEntry } from '../types';
import { 
  ArrowUpRight, ArrowDownRight, Package, AlertCircle, ShoppingCart, Clock, TrendingUp 
} from 'lucide-react';
import { 
  Box, Grid, Card, CardContent, Typography, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton 
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { apiService } from '../services/apiService';

interface Props {
  products: Product[];
  entries: InventoryEntry[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const Dashboard: React.FC<Props> = ({ products, entries }) => {
  const [stats, setStats] = React.useState({
    totalProducts: 0,
    lowStockCount: 0,
    recentActivity: [] as any[],
    movementData: [] as any[],
    pieData: [] as any[]
  });

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiService.getAnalytics();
        setStats({
          totalProducts: data.stats.totalProducts,
          lowStockCount: data.stats.lowStockCount,
          recentActivity: data.recentActivity,
          movementData: data.movementData,
          pieData: data.pieData
        });
      } catch (err) {
        console.error("Dashboard Sync Failed", err);
      }
    };
    fetchAnalytics();
    
    // Refresh every 30s
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" component="h2" fontWeight="700" color="text.primary">
            Executive Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time supply chain overview
          </Typography>
        </Box>
        <Chip 
          icon={<Clock size={16} />} 
          label="Live Sync Active" 
          color="success" 
          variant="outlined" 
          sx={{ bgcolor: 'rgba(237, 247, 237, 0.5)' }} 
        />
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total SKU Items" value={stats.totalProducts} icon={<Package className="text-indigo-600" />} trend="+2 new" trendUp={true} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Critical Low Stock" value={stats.lowStockCount} icon={<AlertCircle className="text-red-500" />} trend="Action required" trendUp={false} isDanger={stats.lowStockCount > 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Monthly Turnover" value="1,284" icon={<ShoppingCart className="text-emerald-600" />} trend="+14% vs LY" trendUp={true} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Warehouse Cap" value="74%" icon={<TrendingUp className="text-amber-600" />} trend="-2% utilization" trendUp={false} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%', minHeight: 400 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">Stock vs Capacity</Typography>
                <IconButton size="small"><MoreVertIcon /></IconButton>
              </Box>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.movementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{paddingBottom: 20}} />
                    <Bar dataKey="current" fill="#1a237e" radius={[4, 4, 0, 0]} name="Current Stock" />
                    <Bar dataKey="capacity" fill="#e0e0e0" radius={[4, 4, 0, 0]} name="Max Capacity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Pie Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%', minHeight: 400 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">Categories</Typography>
                <IconButton size="small"><MoreVertIcon /></IconButton>
              </Box>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity Table */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">Recent Transactions</Typography>
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>View All</Typography>
              </Box>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ITEM CODE</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>NAME</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>COUNT</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>TIMESTAMP</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentActivity.map((activity, idx) => (
                      <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {activity.product?.code}
                        </TableCell>
                        <TableCell>{activity.product?.name}</TableCell>
                        <TableCell>{activity.count}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{new Date(activity.date).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label="Confirmed" size="small" color="success" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.recentActivity.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No recent transactions recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, trend: string, trendUp: boolean, isDanger?: boolean }> = ({ title, value, icon, trend, trendUp, isDanger }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible', borderLeft: isDanger ? '4px solid #ef5350' : 'none' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box p={1} bgcolor="background.default" borderRadius={2} color="primary.main">
          {icon}
        </Box>
        <Box display="flex" alignItems="center" gap={0.5} bgcolor={trendUp ? '#e8f5e9' : '#ffebee'} px={1} py={0.5} borderRadius={1}>
          {trendUp ? <ArrowUpRight size={14} color="#2e7d32" /> : <ArrowDownRight size={14} color="#c62828" />}
          <Typography variant="caption" fontWeight="700" color={trendUp ? 'success.main' : 'error.main'}>
            {trend}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" fontWeight="600">{title}</Typography>
      <Typography variant="h4" fontWeight="700" color="text.primary" mt={1}>{value}</Typography>
    </CardContent>
  </Card>
);

export default Dashboard;
