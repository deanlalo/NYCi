export default function GenerateButtons({ onProposalPDF, onItemizedPDF, onExcel }) {
  return (
    <div className="generate-buttons">
      <button className="btn btn-primary" onClick={onProposalPDF}>
        Full Proposal PDF
      </button>
      <button className="btn btn-outline" onClick={onItemizedPDF}>
        Itemized Estimate PDF
      </button>
      <button className="btn btn-outline" onClick={onExcel}>
        Excel Export
      </button>
    </div>
  );
}
