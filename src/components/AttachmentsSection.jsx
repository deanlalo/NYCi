import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function AttachmentsSection({ attachments, onAdd, onRemove }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) onAdd(accepted);
    },
    [onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
  });

  return (
    <div className="attachments-section">
      <div className="attachments-label">Floor Plans &amp; Reference Documents</div>

      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <span>Drop files here…</span>
        ) : (
          <span>Drag &amp; drop files here, or tap to choose files</span>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="attachment-list">
          {attachments.map((file, i) => (
            <div className="attachment-item" key={`${file.name}-${i}`}>
              <span className="attachment-name">{file.name}</span>
              <span className="attachment-size">{formatSize(file.size)}</span>
              <button
                className="attachment-remove"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
