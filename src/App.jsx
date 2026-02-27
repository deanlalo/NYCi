import { useEstimate } from './hooks/useEstimate';
import { useAdmin } from './hooks/useAdmin';
import { generatePDF } from './utils/pdfExport';
import { generateExcel } from './utils/excelExport';

import TopBar from './components/TopBar';
import SessionBanner from './components/SessionBanner';
import ConstructionToggle from './components/ConstructionToggle';
import ProjectInfo from './components/ProjectInfo';
import FloorCard from './components/FloorCard';
import AttachmentsSection from './components/AttachmentsSection';
import GenerateButtons from './components/GenerateButtons';
import SummaryDrawer from './components/SummaryDrawer';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const estimate = useEstimate();
  const admin = useAdmin();

  function handleNewEstimate() {
    if (
      estimate.state.floors.some((f) => f.items.length > 0) ||
      estimate.state.project.address
    ) {
      if (!window.confirm('Start a new estimate? Current data will be cleared.')) {
        return;
      }
    }
    estimate.newEstimate();
  }

  function handlePDF() {
    generatePDF(estimate.state, estimate.prices, admin.company, admin.headerImage);
  }

  function handleExcel() {
    generateExcel(estimate.state, estimate.prices);
  }

  return (
    <div className={`app${estimate.restored ? ' has-banner' : ''}`}>
      <TopBar onAdmin={admin.open} onNewEstimate={handleNewEstimate} />

      {estimate.restored && (
        <SessionBanner
          onDismiss={estimate.dismissRestored}
          onStartFresh={() => {
            estimate.newEstimate();
          }}
        />
      )}

      <div className="app-layout">
        <main className="main-content">
          <ConstructionToggle
            value={estimate.state.project.constructionType}
            onChange={(v) => estimate.updateProject({ constructionType: v })}
          />

          <ProjectInfo
            project={estimate.state.project}
            onUpdate={estimate.updateProject}
          />

          {estimate.state.floors.map((floor, index) => (
            <FloorCard
              key={floor.id}
              floor={floor}
              index={index}
              prices={estimate.prices}
              onUpdateLabel={estimate.updateFloorLabel}
              onAddItem={estimate.addItem}
              onIncrementItem={estimate.incrementItem}
              onDecrementItem={estimate.decrementItem}
              onRemoveItem={estimate.removeItem}
              onRemoveFloor={estimate.removeFloor}
              floorTotal={estimate.getFloorTotal(floor)}
            />
          ))}

          <button className="btn-add-floor" onClick={estimate.addFloor}>
            + Add Floor
          </button>

          <AttachmentsSection
            attachments={estimate.state.attachments}
            onAdd={estimate.addAttachments}
            onRemove={estimate.removeAttachment}
          />

          <GenerateButtons onPDF={handlePDF} onExcel={handleExcel} />
        </main>

        <SummaryDrawer
          state={estimate.state}
          prices={estimate.prices}
          grandTotal={estimate.grandTotal}
          getFloorTotal={estimate.getFloorTotal}
          onPDF={handlePDF}
          onExcel={handleExcel}
        />
      </div>

      {admin.isOpen && <AdminPanel admin={admin} />}
    </div>
  );
}
