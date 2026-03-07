import { useState, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0f0d;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  :root {
    --green: #00e676;
    --green-dim: #00c853;
    --bg: #0a0f0d;
    --surface: #111814;
    --surface2: #192219;
    --border: #1e2e20;
    --text: #e8f5e9;
    --muted: #5a7a5c;
    --accent: #69f0ae;
  }

  .app {
    min-height: 100vh;
    background: var(--bg);
    padding: 0 0 60px;
    color: var(--text);
  }

  .header {
    padding: 32px 40px 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    background: linear-gradient(180deg, #0f1a10 0%, var(--bg) 100%);
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    background: var(--green);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .header-text h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .header-text p {
    font-size: 13px;
    color: var(--muted);
    margin-top: 2px;
    font-weight: 300;
  }

  .main {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
  }

  @media (max-width: 700px) {
    .main { grid-template-columns: 1fr; }
  }

  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
  }

  .panel-header {
    padding: 18px 22px 14px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .panel-header span {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .upload-zone {
    padding: 32px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .drop-area {
    width: 100%;
    border: 2px dashed var(--border);
    border-radius: 14px;
    padding: 36px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.25s ease;
    background: var(--surface2);
    position: relative;
    overflow: hidden;
  }

  .drop-area:hover, .drop-area.dragging {
    border-color: var(--green);
    background: #0f1e11;
    box-shadow: 0 0 30px #00e67615;
  }

  .drop-area input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .upload-icon {
    width: 56px;
    height: 56px;
    background: #0f1e11;
    border: 1px solid var(--border);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }

  .drop-area h3 {
    font-size: 15px;
    font-weight: 500;
    color: var(--text);
  }

  .drop-area p {
    font-size: 12px;
    color: var(--muted);
    text-align: center;
  }

  .preview-img {
    width: 100%;
    border-radius: 12px;
    border: 1px solid var(--border);
    object-fit: contain;
    max-height: 260px;
    background: var(--surface2);
  }

  .scan-btn {
    width: 100%;
    padding: 14px;
    background: var(--green);
    border: none;
    border-radius: 12px;
    color: #0a0f0d;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .scan-btn:hover:not(:disabled) {
    background: var(--accent);
    box-shadow: 0 4px 20px #00e67640;
    transform: translateY(-1px);
  }

  .scan-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .clear-btn {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-btn:hover {
    border-color: #ff5252;
    color: #ff5252;
  }

  .result-panel {
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .result-body {
    padding: 22px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
  }

  .empty-state .icon {
    font-size: 48px;
    opacity: 0.3;
  }

  .empty-state p {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.6;
  }

  .scanning-anim {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 60px 20px;
    flex: 1;
  }

  .scanner-bar-wrap {
    width: 80%;
    height: 3px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
  }

  .scanner-bar {
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
    animation: scan 1.6s ease-in-out infinite;
    width: 60%;
  }

  @keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(250%); }
  }

  .med-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.4s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .med-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--green);
    border-radius: 99px 0 0 99px;
  }

  .med-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  .med-name {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: var(--text);
    line-height: 1.2;
  }

  .med-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    background: #0f2a12;
    color: var(--green);
    border: 1px solid #1a3d1c;
    padding: 3px 8px;
    border-radius: 99px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .med-rows {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
  }

  .med-row {
    display: flex;
    gap: 8px;
    font-size: 13px;
    align-items: baseline;
  }

  .med-row-label {
    color: var(--muted);
    font-weight: 500;
    min-width: 90px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-family: 'DM Mono', monospace;
  }

  .med-row-value {
    color: var(--text);
    line-height: 1.5;
  }

  .notes-box {
    background: #0f1a10;
    border: 1px solid #1a2e1c;
    border-radius: 12px;
    padding: 14px 16px;
    margin-top: 4px;
  }

  .notes-box h4 {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    margin-bottom: 6px;
  }

  .notes-box p {
    font-size: 13px;
    color: var(--text);
    line-height: 1.6;
    opacity: 0.8;
  }

  .error-box {
    background: #1a0a0a;
    border: 1px solid #3d1a1a;
    border-radius: 12px;
    padding: 16px;
    color: #ff7070;
    font-size: 13px;
    line-height: 1.5;
  }

  .count-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    background: var(--surface2);
    color: var(--green);
    padding: 3px 8px;
    border-radius: 99px;
    border: 1px solid var(--border);
    margin-left: auto;
  }

  .section-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    margin-bottom: 8px;
  }

  .med-description {
    font-size: 12px;
    color: var(--accent);
    opacity: 0.75;
    line-height: 1.5;
    margin-bottom: 6px;
    font-style: italic;
    padding-left: 2px;
  }

  .med-divider {
    height: 1px;
    background: var(--border);
    margin: 8px 0 6px;
  }
`;

export default function PrescriptionScanner() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setImageBase64({ data: base64, type: file.type });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const scanPrescription = async () => {
    if (!imageBase64) return;
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: imageBase64.type, data: imageBase64.data }
              },
              {
                type: "text",
                text: `You are a medical prescription scanner. Carefully analyze this prescription image and extract ALL medication details exactly as written.

Return ONLY a JSON object (no markdown, no backticks, no extra text) with this exact structure:
{
  "patientName": "string or null",
  "doctorName": "string or null",
  "date": "string or null",
  "medications": [
    {
      "name": "exact medication name as written",
      "description": "one concise sentence describing what this medicine is used for",
      "dosage": "dosage/strength (e.g., 500mg)",
      "frequency": "how often (e.g., twice daily)",
      "duration": "how long (e.g., 7 days)",
      "instructions": "any special instructions (e.g., after meals, with water)",
      "quantity": "number of tablets/units if mentioned"
    }
  ],
  "generalNotes": "any other notes or instructions from the prescription"
}

Extract every single medication listed. If a field is not clearly visible or mentioned, use null. Be precise and faithful to exactly what is written in the prescription.`
              }
            ]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError(err.message || "Failed to scan prescription. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="logo-icon">⚕</div>
          <div className="header-text">
            <h1>RxScanner</h1>
            <p>AI-powered prescription reader — extract medication details instantly</p>
          </div>
        </div>

        <div className="main">
          <div className="panel">
            <div className="panel-header">
              <div className="dot" />
              <span>Upload Prescription</span>
            </div>
            <div className="upload-zone">
              {!image ? (
                <div
                  className={`drop-area ${dragging ? "dragging" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  <div className="upload-icon">📋</div>
                  <h3>Drop prescription here</h3>
                  <p>or click to browse<br />JPG, PNG, WEBP supported</p>
                </div>
              ) : (
                <img src={image} alt="Prescription" className="preview-img" />
              )}

              <button
                className="scan-btn"
                onClick={scanPrescription}
                disabled={!image || scanning}
              >
                {scanning ? (
                  <><span style={{ fontSize: 16 }}>⟳</span> Scanning...</>
                ) : (
                  <><span style={{ fontSize: 16 }}>🔍</span> Scan Prescription</>
                )}
              </button>

              {image && (
                <button className="clear-btn" onClick={() => {
                  setImage(null); setImageBase64(null); setResult(null); setError(null);
                }}>
                  Clear & Upload New
                </button>
              )}
            </div>
          </div>

          <div className="panel result-panel">
            <div className="panel-header">
              <div className="dot" style={!result ? { background: "#5a7a5c", boxShadow: "none", animationPlayState: "paused" } : {}} />
              <span>Extracted Medications</span>
              {result?.medications && (
                <div className="count-badge">{result.medications.length} found</div>
              )}
            </div>
            <div className="result-body">
              {!scanning && !result && !error && (
                <div className="empty-state">
                  <div className="icon">💊</div>
                  <p>Upload a prescription image and click <strong style={{ color: "#aaa" }}>Scan Prescription</strong> to extract all medication details automatically.</p>
                </div>
              )}

              {scanning && (
                <div className="scanning-anim">
                  <div style={{ fontSize: 36 }}>🔬</div>
                  <div className="scanner-bar-wrap">
                    <div className="scanner-bar" />
                  </div>
                  <p>READING PRESCRIPTION...</p>
                </div>
              )}

              {error && (
                <div className="error-box">⚠️ {error}</div>
              )}

              {result && !scanning && (
                <>
                  {(result.patientName || result.doctorName || result.date) && (
                    <div className="notes-box">
                      <h4>Prescription Info</h4>
                      {result.patientName && <p>Patient: <strong>{result.patientName}</strong></p>}
                      {result.doctorName && <p>Doctor: <strong>{result.doctorName}</strong></p>}
                      {result.date && <p>Date: <strong>{result.date}</strong></p>}
                    </div>
                  )}

                  <div className="section-label">Medications</div>
                  {result.medications?.length > 0 ? result.medications.map((med, i) => (
                    <div className="med-card" key={i} style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="med-card-top">
                        <div className="med-name">{med.name}</div>
                        {med.dosage && <div className="med-badge">{med.dosage}</div>}
                      </div>
                      {med.description && (
                        <div className="med-description">ℹ️ {med.description}</div>
                      )}
                      <div className="med-divider" />
                      <div className="med-rows">
                        {med.frequency && (
                          <div className="med-row">
                            <span className="med-row-label">Frequency</span>
                            <span className="med-row-value">{med.frequency}</span>
                          </div>
                        )}
                        {med.duration && (
                          <div className="med-row">
                            <span className="med-row-label">Duration</span>
                            <span className="med-row-value">{med.duration}</span>
                          </div>
                        )}
                        {med.quantity && (
                          <div className="med-row">
                            <span className="med-row-label">Quantity</span>
                            <span className="med-row-value">{med.quantity}</span>
                          </div>
                        )}
                        {med.instructions && (
                          <div className="med-row">
                            <span className="med-row-label">Instructions</span>
                            <span className="med-row-value">{med.instructions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="error-box">No medications could be extracted from this image.</div>
                  )}

                  {result.generalNotes && (
                    <div className="notes-box">
                      <h4>General Notes</h4>
                      <p>{result.generalNotes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
