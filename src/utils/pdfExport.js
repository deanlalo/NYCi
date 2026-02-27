import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getItemPrice, getItemName, formatCurrency } from './prices';

/*
 * PDF Template — modeled after the NYC Intercom "Lady D" project agreement.
 *
 * Layout per page:
 *   • Top-right: company logo/name + address + phone + email + website
 *   • Bottom: company name left, page # right, thin rule
 *
 * Document flow:
 *   1. Title block: "Project Agreement" + client/project info + date
 *   2. Per-floor scope sections with equipment tables
 *   3. Pricing summary table (per-scope subtotals → grand total)
 *   4. Payment schedule (50 / 30 / 15 / 5)
 *   5. General Terms & Conditions
 *   6. Reference documents
 *   7. Signature page
 */

export function generatePDF(state, prices, companyInfo, headerImage) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20; // margin
  const red = [224, 32, 32];

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

  /* ━━ helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  function addHeader() {
    const rx = pw - m; // right-edge x

    /* Logo or company name — top right */
    if (headerImage) {
      try {
        doc.addImage(headerImage, 'PNG', rx - 50, 10, 50, 20);
      } catch {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(companyName, rx, 18, { align: 'right' });
      }
    } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(companyName, rx, 18, { align: 'right' });
    }

    /* Contact info line(s) under company name */
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    let cy = headerImage ? 33 : 23;
    const parts = [ci.address, ci.phone, ci.email, ci.website].filter(Boolean);
    if (parts.length > 0) {
      const mid = Math.ceil(parts.length / 2);
      const line1 = parts.slice(0, mid).join('  •  ');
      const line2 = parts.slice(mid).join('  •  ');
      doc.text(line1, rx, cy, { align: 'right' });
      if (line2) doc.text(line2, rx, cy + 4, { align: 'right' });
    }

    /* Red accent line */
    doc.setDrawColor(...red);
    doc.setLineWidth(0.7);
    const lineY = headerImage ? 40 : 30;
    doc.line(m, lineY, pw - m, lineY);
    doc.setDrawColor(0);
    doc.setTextColor(0);
  }

  function addFooter(pageNum, totalPages) {
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(m, ph - 16, pw - m, ph - 16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140);
    doc.text(companyName, m, ph - 10);
    doc.text(`Page ${pageNum} of ${totalPages}`, pw - m, ph - 10, { align: 'right' });
    doc.setTextColor(0);
  }

  function needsNewPage(y, needed = 50) {
    if (y + needed > ph - 30) {
      doc.addPage();
      addHeader();
      return headerImage ? 48 : 38;
    }
    return y;
  }

  function sectionTitle(text, y) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(text, m, y);
    doc.setDrawColor(220);
    doc.setLineWidth(0.3);
    doc.line(m, y + 2, pw - m, y + 2);
    return y + 10;
  }

  /* ━━ PAGE 1 — Title & Project Info ━━━━━━ */

  addHeader();
  let y = headerImage ? 50 : 40;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...red);
  doc.text('Project Agreement', m, y);
  doc.setTextColor(0);
  y += 14;

  const projectRows = [
    ['Client:', state.project.contactName || '—'],
    ['Contractor:', companyName],
    ['Project Location:', state.project.address || '—'],
    ['Contact Phone:', state.project.contactPhone || '—'],
    ['Construction Type:', constructionLabel],
    ['Date:', today],
  ];

  doc.autoTable({
    startY: y,
    body: projectRows,
    margin: { left: m, right: pw / 2 },
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: { top: 2.5, bottom: 2.5, left: 0, right: 8 } },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, textColor: [100, 100, 100] },
      1: { fontStyle: 'normal' },
    },
  });

  y = doc.lastAutoTable.finalY + 16;

  /* ━━ SCOPE SECTIONS (one per floor) ━━━━━ */

  let grandTotal = 0;
  const floorTotals = [];

  state.floors.forEach((floor, fi) => {
    y = needsNewPage(y, 60);

    const scopeNum = fi + 1;
    const scopeLabel = `Scope ${scopeNum}: ${floor.label || 'Unnamed Floor'}`;
    y = sectionTitle(scopeLabel, y);

    if (floor.items.length > 0) {
      const rows = floor.items.map((item) => {
        const name = getItemName(item);
        const unit = getItemPrice(item, prices);
        const total = unit * item.qty;
        return [String(item.qty), name, formatCurrency(unit), formatCurrency(total)];
      });

      const floorTotal = floor.items.reduce(
        (s, item) => s + getItemPrice(item, prices) * item.qty,
        0
      );
      grandTotal += floorTotal;
      floorTotals.push({ label: floor.label || `Floor ${fi + 1}`, total: floorTotal });

      doc.autoTable({
        startY: y,
        head: [['Qty', 'Item', 'Unit Price', 'Total']],
        body: rows,
        foot: [['', '', 'Subtotal', formatCurrency(floorTotal)]],
        margin: { left: m, right: m },
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: {
          fillColor: [15, 15, 15],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
        },
        footStyles: {
          fillColor: [245, 245, 245],
          textColor: [15, 15, 15],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 18 },
          1: { cellWidth: 'auto' },
          2: { halign: 'right', cellWidth: 32 },
          3: { halign: 'right', cellWidth: 32 },
        },
        theme: 'grid',
      });

      y = doc.lastAutoTable.finalY + 14;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(140);
      doc.text('No items in this scope.', m, y);
      doc.setTextColor(0);
      floorTotals.push({ label: floor.label || `Floor ${fi + 1}`, total: 0 });
      y += 14;
    }
  });

  /* ━━ PRICING SUMMARY ━━━━━━━━━━━━━━━━━━━━ */

  y = needsNewPage(y, 80);
  y = sectionTitle('Pricing Summary', y);

  const summaryRows = floorTotals.map((ft) => [ft.label, formatCurrency(ft.total)]);

  doc.autoTable({
    startY: y,
    head: [['Scope', 'Subtotal']],
    body: summaryRows,
    foot: [['Total Project Cost', formatCurrency(grandTotal)]],
    margin: { left: m, right: pw / 2 + 10 },
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: {
      fillColor: [15, 15, 15],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: {
      fillColor: [224, 32, 32],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'right', cellWidth: 35 },
    },
    theme: 'grid',
  });

  y = doc.lastAutoTable.finalY + 6;

  /* Tax & contract total */
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('NYS Sales Tax (8.875%):', pw - m - 50, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('$0.00', pw - m, y + 4, { align: 'right' });
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Total Contract Value:', pw - m - 50, y + 4);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...red);
  doc.text(formatCurrency(grandTotal), pw - m, y + 4, { align: 'right' });
  doc.setTextColor(0);
  y += 20;

  /* ━━ PAYMENT SCHEDULE ━━━━━━━━━━━━━━━━━━━ */

  y = needsNewPage(y, 80);
  y = sectionTitle('Payment Schedule', y);

  const milestones = [
    { label: 'Deposit (50%)', pct: 0.5, note: 'Due upon signing — hardware procurement & project mobilization.' },
    { label: 'Progress Payment: Rough-In (30%)', pct: 0.3, note: 'Due upon completion of all physical cabling & infrastructure.' },
    { label: 'Progress Payment: Equipment & Programming (15%)', pct: 0.15, note: 'Due upon hardware installation & system configuration.' },
    { label: 'Final Retainage (5%)', pct: 0.05, note: 'Due upon final system testing, client training, and handover of all documentation.' },
  ];

  doc.setFontSize(10);
  milestones.forEach((ms) => {
    y = needsNewPage(y, 18);
    const amt = grandTotal * ms.pct;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`• ${ms.label} — ${formatCurrency(amt)}`, m + 2, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(ms.note, m + 8, y);
    doc.setTextColor(0);
    y += 10;
  });

  y += 6;

  /* ━━ GENERAL TERMS & CONDITIONS ━━━━━━━━━ */

  y = needsNewPage(y, 90);
  y = sectionTitle('General Terms & Conditions', y);

  const terms = [
    {
      heading: 'Warranty & Support',
      body:
        'All equipment is subject to the manufacturer\'s warranty. ' +
        companyName +
        ' provides a 180-day limited warranty on installation labor covering equipment mounting and programming. ' +
        'Warranty does not cover damage caused by "Acts of God," electrical surges, client-side network tampering, or unauthorized third-party modifications. ' +
        'All materials remain property of ' + companyName + ' until paid in full.',
    },
    {
      heading: 'Client Responsibilities',
      body:
        'Client shall provide technician access to all MDF/IDF rooms and work areas during standard business hours. ' +
        'Client is responsible for ensuring active ISP handoff is available for system programming and providing dedicated electrical outlets where specified.',
    },
    {
      heading: 'Change Orders',
      body:
        'Any additions or deviations from the scopes listed above will be documented in a separate Change Order and billed at ' +
        companyName +
        '\'s standard hourly rate plus materials.',
    },
  ];

  doc.setFontSize(10);
  terms.forEach((t, idx) => {
    y = needsNewPage(y, 30);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`${idx + 1}. ${t.heading}`, m, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    const lines = doc.splitTextToSize(t.body, pw - 2 * m - 4);
    doc.text(lines, m + 4, y);
    y += lines.length * 4.5 + 8;
    doc.setTextColor(0);
  });

  /* ━━ REFERENCE DOCUMENTS ━━━━━━━━━━━━━━━━ */

  if (state.attachments.length > 0) {
    y = needsNewPage(y, 30);
    y = sectionTitle('Reference Documents', y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const names = state.attachments.map((a) => a.name).join(', ');
    const lines = doc.splitTextToSize(
      'The following reference files are attached to this proposal: ' + names,
      pw - 2 * m
    );
    doc.text(lines, m, y);
    y += lines.length * 5 + 12;
  }

  /* ━━ SIGN-OFF PAGE ━━━━━━━━━━━━━━━━━━━━━━ */

  doc.addPage();
  addHeader();
  y = headerImage ? 55 : 45;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Sign-Off & Authorization', m, y);
  y += 20;

  const sigBlocks = [
    { role: `${companyName} (Contractor)`, fields: ['Authorized Signature', 'Printed Name', 'Date'] },
    { role: 'Client Name / Company', fields: ['Authorized Signature', 'Printed Name', 'Date'] },
  ];

  sigBlocks.forEach((block) => {
    y = needsNewPage(y, 60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(block.role, m, y);
    y += 4;
    doc.setDrawColor(...red);
    doc.setLineWidth(0.5);
    doc.line(m, y, pw - m, y);
    doc.setDrawColor(0);
    y += 14;

    block.fields.forEach((field) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(field + ':', m, y);
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.line(m + 42, y, pw - m, y);
      doc.setTextColor(0);
      y += 14;
    });

    y += 12;
  });

  /* ━━ Apply footers to every page ━━━━━━━━ */

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(i, pageCount);
  }

  /* ━━ Download ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  const filename = `Proposal_${(state.project.address || 'Untitled').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
