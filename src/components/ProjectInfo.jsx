export default function ProjectInfo({ project, onUpdate }) {
  return (
    <div className="card project-info">
      <div className="form-group">
        <label htmlFor="proj-address">Project Address</label>
        <input
          id="proj-address"
          type="text"
          value={project.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Enter project address"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="proj-contact">Point of Contact</label>
          <input
            id="proj-contact"
            type="text"
            value={project.contactName}
            onChange={(e) => onUpdate({ contactName: e.target.value })}
            placeholder="Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="proj-phone">Phone</label>
          <input
            id="proj-phone"
            type="tel"
            inputMode="tel"
            value={project.contactPhone}
            onChange={(e) => onUpdate({ contactPhone: e.target.value })}
            placeholder="Phone number"
          />
        </div>
      </div>
    </div>
  );
}
