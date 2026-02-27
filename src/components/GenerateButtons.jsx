export default function GenerateButtons({ onPDF, onExcel }) {
  return (
    <div className="generate-buttons">
      <button className="btn btn-primary" onClick={onPDF}>
        Download PDF Proposal
      </button>
      <button className="btn btn-outline" onClick={onExcel}>
        Download Excel
      </button>
    </div>
  );
}
