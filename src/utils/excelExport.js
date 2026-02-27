import * as XLSX from 'xlsx';
import { getItemPrice, getItemName } from './prices';

export function generateExcel(state, prices) {
  const wb = XLSX.utils.book_new();

  /* ── Summary sheet ─────────────────────── */
  const summaryData = [['Floor', 'Subtotal']];
  let grandTotal = 0;

  state.floors.forEach((floor) => {
    const floorTotal = floor.items.reduce(
      (sum, item) => sum + getItemPrice(item, prices) * item.qty,
      0
    );
    grandTotal += floorTotal;
    summaryData.push([floor.label || 'Unnamed Floor', floorTotal]);
  });

  summaryData.push(['Grand Total', grandTotal]);

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  /* format currency column */
  const range = XLSX.utils.decode_range(summarySheet['!ref']);
  for (let r = 1; r <= range.e.r; r++) {
    const cell = summarySheet[XLSX.utils.encode_cell({ r, c: 1 })];
    if (cell) cell.z = '$#,##0.00';
  }

  /* column widths */
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  /* ── Per-floor sheets ──────────────────── */
  state.floors.forEach((floor) => {
    const data = [['Item', 'Qty', 'Unit Price', 'Line Total']];
    let subtotal = 0;

    floor.items.forEach((item) => {
      const name = getItemName(item);
      const unitPrice = getItemPrice(item, prices);
      const lineTotal = unitPrice * item.qty;
      subtotal += lineTotal;
      data.push([name, item.qty, unitPrice, lineTotal]);
    });

    data.push(['Subtotal', '', '', subtotal]);

    const sheet = XLSX.utils.aoa_to_sheet(data);

    /* format currency columns (C & D) */
    const r2 = XLSX.utils.decode_range(sheet['!ref']);
    for (let r = 1; r <= r2.e.r; r++) {
      for (let c = 2; c <= 3; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        if (cell && typeof cell.v === 'number') cell.z = '$#,##0.00';
      }
    }

    sheet['!cols'] = [{ wch: 25 }, { wch: 8 }, { wch: 14 }, { wch: 16 }];

    /* sanitize sheet name (max 31 chars, no special chars) */
    const sheetName = (floor.label || 'Floor')
      .substring(0, 31)
      .replace(/[\\\/\?\*\[\]:]/g, '');

    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
  });

  /* ── Download ──────────────────────────── */
  const filename = `Estimate_${(state.project.address || 'Untitled').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
