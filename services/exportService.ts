
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Product, InventoryEntry } from '../types';

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (products: Product[], entries: InventoryEntry[], title: string) => {
  const doc = new jsPDF();
  doc.text(title, 20, 10);
  
  const tableData = products.map(p => {
    const lastEntry = entries.filter(e => e.productId === p.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    return [p.code, p.name, p.unit, p.capacity, lastEntry ? lastEntry.count : 0];
  });

  (doc as any).autoTable({
    head: [['Code', 'Name', 'Unit', 'Capacity', 'Current Stock']],
    body: tableData,
    startY: 20
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};
