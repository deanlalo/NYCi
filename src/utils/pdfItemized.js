import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getItemPrice, getItemName, formatCurrency } from './prices';

/*
 * Simple Itemized Estimate PDF
 * Clean line-item layout: project info → floor tables → grand total → signature.
 * No terms, payment schedule, or contract language.
 */

export function generateItemizedPDF(state, prices, companyInfo, headerImage) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;

  const ci = companyInfo || {};
  const companyName = ci.name || 'Low Voltage Contractor';

  const constructionLabel =
    state.project.constructionType === 'ground-up'
      ? 'Ground-Up / Open Walls'
      : 'Existing Construction';

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  /* ── Header (every page) ───────────────── */

  function addHeader() {
    if (headerImage) {
      try {
        doc.addImage(headerImage, 'PNG', m, 8, 40, 18);
      } catch {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, m, 20);
      }
    } else {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(companyName, m, 20);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('ESTIMATE', pw - m, 14, { align: 'right' });
    doc.text(today, pw - m, 20, { align: 'right' });

    /* contact line */
    const parts = [ci.phone, ci.email, ci.website].filter(Boolean);
    if (parts.length > 0) {
      doc.setFontSize(8);
      doc.text(parts.join('  •  '), pw - m, 26, { align: 'right' });
    }

    doc.setTextColor(0);
  }

  /* ── Footer (every page) ───────────────── */

  function addFooter(pageNum, totalPages) {
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(m, ph - 18, pw - m, ph - 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140);
    doc.text(`Page ${pageNum} of ${totalPages}`, pw / 2, ph - 11, {
      align: 'center',
    });
    doc.setTextColor(0);
  }

  /* ── Page 1: Project Info ──────────────── */

  addHeader();
  let y = 38;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Address:', m, y);
  doc.setFont('helvetica', 'normal');
  doc.text(state.project.address || 'N/A', m + 42, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Contact:', m, y);
  doc.setFont('helvetica', 'normal');
  const contactStr =
    [state.project.contactName, state.project.contactPhone]
      .filter(Boolean)
      .join(' — ') || 'N/A';
  doc.text(contactStr, m + 24, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Construction:', m, y);
  doc.setFont('helvetica', 'normal');
  doc.text(constructionLabel, m + 36, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', m, y);
  doc.setFont('helvetica', 'normal');
  doc.text(today, m + 16, y);
  y += 16;

  /* ── Floor tables ──────────────────────── */

  let grandTotal = 0;

  state.floors.forEach((floor) => {
    if (y > 240) {
      doc.addPage();
      addHeader();
      y = 38;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(floor.label || 'Unnamed Floor', m, y);
    y += 3;

    if (floor.items.length > 0) {
      const rows = floor.items.map((item) => {
        const name = getItemName(item);
        const unit = getItemPrice(item, prices);
        const total = unit * item.qty;
        return [name, item.qty, formatCurrency(unit), formatCurrency(total)];
      });

      const floorTotal = floor.items.reduce(
        (s, item) => s + getItemPrice(item, prices) * item.qty,
        0
      );
      grandTotal += floorTotal;

      doc.autoTable({
        startY: y,
        head: [['Item', 'Qty', 'Unit Price', 'Total']],
        body: rows,
        foot: [['', '', 'Subtotal', formatCurrency(floorTotal)]],
        margin: { left: m, right: m },
        styles: { fontSize: 10, cellPadding: 3.5 },
        headStyles: {
          fillColor: [15, 15, 15],
          textColor: 255,
          fontStyle: 'bold',
        },
        footStyles: {
          fillColor: [245, 245, 245],
          textColor: [15, 15, 15],
          fontStyle: 'bold',
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' },
        },
        theme: 'grid',
      });

      y = doc.lastAutoTable.finalY + 12;
    } else {
      y += 4;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(140);
      doc.text('No items', m, y);
      doc.setTextColor(0);
      y += 12;
    }
  });

  /* ── Grand Total ───────────────────────── */

  if (y > 250) {
    doc.addPage();
    addHeader();
    y = 38;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(224, 32, 32);
  doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, pw - m, y, {
    align: 'right',
  });
  doc.setTextColor(0);
  y += 16;

  /* ── Reference Documents ───────────────── */

  if (state.attachments.length > 0) {
    if (y > 260) {
      doc.addPage();
      addHeader();
      y = 38;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Reference Documents', m, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const names = state.attachments.map((a) => a.name).join(', ');
    const lines = doc.splitTextToSize(
      `Attached reference files: ${names}`,
      pw - 2 * m
    );
    doc.text(lines, m, y);
    y += lines.length * 5 + 12;
  }

  /* ── Signature Line ────────────────────── */

  if (y > 255) {
    doc.addPage();
    addHeader();
    y = 38;
  }
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Accepted by: _________________________________', m, y);
  doc.text('Date: _______________', pw - m - 55, y);

  /* ── Apply footers to all pages ────────── */

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(i, pageCount);
  }

  /* ── Save ──────────────────────────────── */

  const filename = `Estimate_${(state.project.address || 'Untitled').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
