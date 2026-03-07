import { useState, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #030712; --glass: rgba(255,255,255,0.04); --glass-border: rgba(255,255,255,0.08); --cyan: #06b6d4; --cyan-soft: rgba(6,182,212,0.12); --emerald: #10b981; --blue: #3b82f6; --text: #f0f9ff; --text-dim: rgba(240,249,255,0.6); --text-faint: rgba(240,249,255,0.28); }
  body { background: var(--bg); font-family: 'Outfit', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .app { min-height:100vh; background: radial-gradient(ellipse 80% 50% at 20% -10%, rgba(6,182,212,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(59,130,246,0.08) 0%, transparent 55%), #030712; color:var(--text); padding-bottom:80px; position:relative; }
  .orb { position:fixed; pointer-events:none; z-index:0; border-radius:50%; }
  .orb1 { width:600px;height:600px;background:radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%);top:-200px;left:-100px;animation:floatOrb 20s ease-in-out infinite; }
  .orb2 { width:500px;height:500px;background:radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%);bottom:-100px;right:-100px;animation:floatOrb 25s ease-in-out infinite reverse; }
  @keyframes floatOrb { 0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(30px,-40px) scale(1.05);}66%{transform:translate(-20px,20px) scale(0.97);} }
  .header { position:relative;z-index:10;padding:26px 40px 22px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(20px);background:rgba(3,7,18,0.7); }
  @media(max-width:600px){ .header{padding:18px;} }
  .header-left{display:flex;align-items:center;gap:14px;}
  .logo{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,rgba(6,182,212,0.25),rgba(59,130,246,0.18));border:1px solid rgba(6,182,212,0.35);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 20px rgba(6,182,212,0.18);}
  .brand h1{font-family:'Instrument Serif',serif;font-size:24px;background:linear-gradient(135deg,#f0f9ff 30%,rgba(6,182,212,0.9));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .brand p{font-size:12px;color:var(--text-faint);margin-top:1px;}
  .header-badge{display:flex;align-items:center;gap:6px;padding:6px 14px;background:var(--cyan-soft);border:1px solid rgba(6,182,212,0.22);border-radius:99px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--cyan);}
  .pulse-dot{width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 6px var(--cyan);animation:blink 2s ease-in-out infinite;}
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.4;}}
  .step-bar{position:relative;z-index:5;max-width:700px;margin:32px auto 0;padding:0 28px;display:flex;align-items:center;}
  .step-item{display:flex;align-items:center;gap:10px;flex:1;transition:opacity 0.4s;}
  .step-item.inactive{opacity:0.35;}
  .step-circle{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:500;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:var(--text-faint);transition:all 0.4s;}
  .step-circle.active{background:linear-gradient(135deg,rgba(6,182,212,0.25),rgba(59,130,246,0.18));border-color:rgba(6,182,212,0.5);color:var(--cyan);box-shadow:0 0 16px rgba(6,182,212,0.2);}
  .step-circle.done{background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.15));border-color:rgba(16,185,129,0.4);color:var(--emerald);}
  .step-circle.scanning-pulse{animation:stepPulse 1.2s ease-in-out infinite;}
  @keyframes stepPulse{0%,100%{box-shadow:0 0 16px rgba(6,182,212,0.2);}50%{box-shadow:0 0 28px rgba(6,182,212,0.5);}}
  .step-info{display:flex;flex-direction:column;gap:2px;}
  .step-title{font-size:13px;font-weight:600;color:var(--text-dim);}
  .step-sub{font-size:11px;color:var(--text-faint);font-family:'JetBrains Mono',monospace;}
  .step-connector{flex:1;height:1px;max-width:80px;margin:0 12px;background:linear-gradient(90deg,rgba(6,182,212,0.2),rgba(255,255,255,0.06));position:relative;overflow:hidden;}
  .step-connector.active::after{content:'';position:absolute;top:0;left:0;height:100%;width:100%;background:linear-gradient(90deg,var(--cyan),var(--blue));animation:connFill 0.8s ease forwards;}
  @keyframes connFill{from{width:0%;}to{width:100%;}}
  .main-wrap{position:relative;z-index:5;max-width:900px;margin:24px auto 0;padding:0 28px;}
  @media(max-width:600px){.main-wrap{padding:0 14px;}}
  .upload-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:24px;backdrop-filter:blur(24px);overflow:hidden;position:relative;transition:all 0.5s;}
  .upload-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
  .upload-card.exit{animation:cardExit 0.5s ease forwards;}
  @keyframes cardExit{0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(0.95) translateY(-20px);}}
  .card-hdr{padding:20px 24px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:10px;}
  .card-lbl{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--text-faint);flex:1;}
  .card-tag{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 10px;border-radius:99px;background:var(--cyan-soft);color:var(--cyan);border:1px solid rgba(6,182,212,0.2);}
  .upload-body{padding:24px;display:flex;flex-direction:column;gap:14px;}
  .drop-zone{position:relative;border:1.5px dashed rgba(255,255,255,0.09);border-radius:18px;padding:48px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;cursor:pointer;transition:all 0.3s;background:rgba(255,255,255,0.018);overflow:hidden;}
  .drop-zone:hover,.drop-zone.dz-on{border-color:rgba(6,182,212,0.45);background:rgba(6,182,212,0.03);box-shadow:inset 0 0 40px rgba(6,182,212,0.04);}
  .drop-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2;}
  .dz-icon{width:70px;height:70px;border-radius:20px;background:linear-gradient(135deg,rgba(6,182,212,0.14),rgba(59,130,246,0.1));border:1px solid rgba(6,182,212,0.2);display:flex;align-items:center;justify-content:center;font-size:30px;z-index:1;}
  .dz-text h3{font-size:15px;font-weight:600;color:var(--text);text-align:center;}
  .dz-text p{font-size:12px;color:var(--text-faint);text-align:center;margin-top:4px;}
  .fmt-chips{display:flex;gap:5px;}
  .fchip{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:var(--text-faint);}
  .preview-wrap{position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--glass-border);}
  .preview-wrap img{width:100%;max-height:260px;object-fit:contain;display:block;}
  .preview-lbl{position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(0deg,rgba(3,7,18,0.9),transparent);font-size:11px;color:rgba(16,185,129,0.8);font-family:'JetBrains Mono',monospace;}
  .btn-scan{width:100%;padding:15px 20px;border:none;border-radius:14px;cursor:pointer;font-family:'Outfit',sans-serif;font-size:16px;font-weight:700;transition:all 0.25s;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,rgba(6,182,212,0.9),rgba(59,130,246,0.85));color:#fff;box-shadow:0 4px 24px rgba(6,182,212,0.25);}
  .btn-scan:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 32px rgba(6,182,212,0.35);}
  .btn-scan:disabled{opacity:0.3;cursor:not-allowed;}
  .btn-clear{width:100%;padding:11px;border:1px solid rgba(255,255,255,0.07);border-radius:12px;background:transparent;color:var(--text-faint);font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s;}
  .btn-clear:hover{border-color:rgba(239,68,68,0.35);color:rgba(239,68,68,0.75);}
  .scan-overlay{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;background:rgba(3,7,18,0.97);backdrop-filter:blur(16px);animation:overlayIn 0.4s ease both;}
  @keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
  .scan-overlay.exit{animation:overlayOut 0.6s ease forwards;}
  @keyframes overlayOut{0%{opacity:1;}100%{opacity:0;transform:scale(1.04);}}
  .scan-image-wrap{position:relative;width:280px;border-radius:20px;overflow:hidden;border:1px solid rgba(6,182,212,0.2);box-shadow:0 0 60px rgba(6,182,212,0.12);}
  .scan-image-wrap img{width:100%;max-height:200px;object-fit:contain;display:block;filter:brightness(0.6);}
  .laser-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),var(--cyan),transparent);box-shadow:0 0 12px var(--cyan);animation:laserSweep 1.6s ease-in-out infinite;}
  @keyframes laserSweep{0%{top:0%;}100%{top:100%;}}
  .scan-corner{position:absolute;width:20px;height:20px;border-color:var(--cyan);border-style:solid;}
  .sc-tl{top:8px;left:8px;border-width:2px 0 0 2px;} .sc-tr{top:8px;right:8px;border-width:2px 2px 0 0;}
  .sc-bl{bottom:8px;left:8px;border-width:0 0 2px 2px;} .sc-br{bottom:8px;right:8px;border-width:0 2px 2px 0;}
  .scan-rings-wrap{position:relative;width:90px;height:90px;display:flex;align-items:center;justify-content:center;}
  .ring{position:absolute;border-radius:50%;border:2px solid transparent;}
  .ring1{width:90px;height:90px;border-top-color:var(--cyan);animation:spinR 1s linear infinite;}
  .ring2{width:64px;height:64px;border-top-color:var(--blue);animation:spinR 1.6s linear infinite reverse;}
  .ring3{width:40px;height:40px;border-top-color:var(--emerald);animation:spinR 2.2s linear infinite;}
  .ring-core{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.3),transparent);border:1px solid rgba(6,182,212,0.4);animation:corePulse 1.5s ease-in-out infinite;}
  @keyframes spinR{to{transform:rotate(360deg);}} @keyframes corePulse{0%,100%{transform:scale(1);}50%{transform:scale(1.3);}}
  .scan-prog-wrap{width:280px;}
  .scan-prog-label{display:flex;justify-content:space-between;margin-bottom:8px;}
  .scan-prog-title{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--cyan);text-transform:uppercase;letter-spacing:1.5px;}
  .scan-prog-pct{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-faint);}
  .scan-prog-track{height:3px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;}
  .scan-prog-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--blue));border-radius:99px;transition:width 0.3s ease;}
  .scan-steps{display:flex;flex-direction:column;gap:8px;width:280px;}
  .scan-step{display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);font-size:12px;color:var(--text-faint);transition:all 0.4s;}
  .scan-step.active{background:rgba(6,182,212,0.06);border-color:rgba(6,182,212,0.2);color:var(--text-dim);}
  .scan-step.done{background:rgba(16,185,129,0.05);border-color:rgba(16,185,129,0.15);color:rgba(16,185,129,0.7);}
  .ss-icon{font-size:14px;flex-shrink:0;}
  .results-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:24px;backdrop-filter:blur(24px);overflow:hidden;position:relative;animation:cardEnter 0.6s cubic-bezier(0.16,1,0.3,1) both;}
  .results-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(6,182,212,0.25),transparent);}
  @keyframes cardEnter{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
  .results-body{padding:22px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;}
  .results-body::-webkit-scrollbar{width:3px;}
  .results-body::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.18);border-radius:99px;}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .stat-tile{padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,rgba(6,182,212,0.06),rgba(59,130,246,0.04));border:1px solid rgba(6,182,212,0.12);display:flex;flex-direction:column;gap:4px;}
  .st-icon{font-size:18px;} .st-val{font-family:'Instrument Serif',serif;font-size:26px;color:var(--text);line-height:1;} .st-lbl{font-size:11px;color:var(--text-faint);}
  .notes-box{background:linear-gradient(135deg,rgba(16,185,129,0.05),rgba(6,182,212,0.02));border:1px solid rgba(16,185,129,0.14);border-radius:14px;padding:14px 16px;}
  .nlbl{font-family:'JetBrains Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:var(--emerald);margin-bottom:7px;}
  .ntxt{font-size:13px;color:var(--text-dim);line-height:1.6;}
  .info-box{background:linear-gradient(135deg,rgba(6,182,212,0.05),rgba(59,130,246,0.03));border:1px solid rgba(6,182,212,0.14);border-radius:14px;padding:14px 16px;}
  .ibox-hdr{font-family:'JetBrains Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:var(--cyan);margin-bottom:10px;display:flex;align-items:center;gap:8px;}
  .ibox-hdr::after{content:'';flex:1;height:1px;background:rgba(6,182,212,0.14);}
  .irow{display:flex;align-items:baseline;gap:10px;font-size:13px;margin-bottom:5px;}
  .irow:last-child{margin-bottom:0;}
  .ikey{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--text-faint);min-width:58px;text-transform:uppercase;letter-spacing:0.8px;}
  .ival{color:var(--text);font-weight:500;}
  .sec-lbl{display:flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:2px;color:var(--text-faint);}
  .sec-lbl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.06);}
  .med-card{background:var(--glass);border:1px solid var(--glass-border);border-radius:16px;overflow:hidden;position:relative;opacity:1;margin-bottom:2px;}
  .med-card:hover{border-color:rgba(6,182,212,0.3);box-shadow:0 8px 28px rgba(0,0,0,0.18);transform:translateY(-1px);}
  .med-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--cyan),var(--blue),var(--emerald));}
  .mc-top{padding:14px 16px 0 19px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
  .mc-name{font-family:'Instrument Serif',serif;font-size:19px;color:var(--text);line-height:1.2;}
  .mc-badge{padding:3px 9px;background:linear-gradient(135deg,rgba(6,182,212,0.14),rgba(59,130,246,0.09));border:1px solid rgba(6,182,212,0.22);border-radius:7px;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--cyan);white-space:nowrap;flex-shrink:0;}
  .mc-desc{padding:7px 16px 0 19px;font-size:12px;color:rgba(6,182,212,0.75);font-style:italic;line-height:1.5;display:flex;gap:5px;align-items:flex-start;}
  .mc-desc-i{font-size:11px;flex-shrink:0;opacity:0.7;font-style:normal;}
  .mc-div{margin:11px 16px 0 19px;height:1px;background:rgba(255,255,255,0.06);}
  .mc-details{padding:9px 16px 14px 19px;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .mc-det{display:flex;flex-direction:column;gap:2px;} .mc-det.fw{grid-column:1/-1;}
  .dlbl{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-faint);}
  .dval{font-size:12.5px;color:var(--text-dim);font-weight:500;line-height:1.4;}
  .err-box{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:13px;padding:14px 16px;display:flex;gap:9px;align-items:flex-start;font-size:13px;color:rgba(252,165,165,0.88);line-height:1.5;}
  .btn-rescan{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border:1px solid rgba(6,182,212,0.25);border-radius:12px;background:var(--cyan-soft);color:var(--cyan);font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:4px;}
  .btn-rescan:hover{background:rgba(6,182,212,0.18);}
  .count-pill{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 10px;margin-left:auto;background:linear-gradient(135deg,rgba(6,182,212,0.14),rgba(59,130,246,0.09));border:1px solid rgba(6,182,212,0.22);border-radius:99px;color:var(--cyan);}
`;

const SCAN_STEPS = [
  { icon: "🖼️", label: "Loading image data" },
  { icon: "🔬", label: "Analyzing prescription" },
  { icon: "💊", label: "Extracting medications" },
  { icon: "📋", label: "Compiling results" },
];

const notNull = (v) => v !== null && v !== undefined && v !== "null" && v !== "undefined" && String(v).trim() !== "";

export default function PrescriptionScanner() {
  const [phase, setPhase] = useState("upload");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env?.VITE_GROQ_API_KEY || "");
  const [scanProgress, setScanProgress] = useState(0);
  const [activeScanStep, setActiveScanStep] = useState(0);
  const [doneScanSteps, setDoneScanSteps] = useState([]);
  const [overlayExiting, setOverlayExiting] = useState(false);
  const [uploadExiting, setUploadExiting] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(file));
    setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64({ data: e.target.result.split(",")[1], type: file.type });
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const animateScanSteps = useCallback(() => {
    const delays = [0, 800, 1800, 2800];
    const durations = [700, 900, 900, 600];
    delays.forEach((delay, i) => {
      setTimeout(() => { setActiveScanStep(i); setScanProgress(Math.round(((i + 1) / SCAN_STEPS.length) * 85)); }, delay);
      setTimeout(() => { setDoneScanSteps(prev => [...prev, i]); }, delay + durations[i]);
    });
  }, []);

  const scanPrescription = async () => {
    if (!imageBase64) return;
    setUploadExiting(true);
    await new Promise(r => setTimeout(r, 450));
    setPhase("scanning"); setScanProgress(0); setActiveScanStep(0); setDoneScanSteps([]);
    const scanStart = Date.now();
    animateScanSteps();

    let parsed = null, apiError = null;
    try {
      const prompt = "You are a medical prescription scanner. Analyze this prescription image carefully and extract ALL details.\n" +
        "Return ONLY valid JSON with no markdown, no backticks, no extra text:\n" +
        '{"patientName":"string or null","doctorName":"string or null","date":"string or null",' +
        '"generalNotes":"any doctor notes or null",' +
        '"medications":[{"name":"exact name","description":"1-2 sentences on what this medicine is and what it treats",' +
        '"dosage":"strength like 500mg or null","frequency":"how often or null","duration":"how long or null",' +
        '"instructions":"special notes or null","quantity":"tablet count or null"}]}' +
        "\nRules: 1) Extract every single medication listed. 2) description is REQUIRED for every medication - never null. 3) Use JSON null (not the word null) for unknown fields.";

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: "data:" + imageBase64.type + ";base64," + imageBase64.data } },
              { type: "text", text: prompt }
            ]
          }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error("Groq Error: " + data.error.message);
      if (!data.choices) throw new Error("No response from API");
      let text = data.choices[0].message.content;
      text = text.replaceAll("```json", "").replaceAll("```", "").trim();
      parsed = JSON.parse(text);
    } catch (err) {
      apiError = err.message || "Failed to scan. Please try again.";
    }

    const elapsed = Date.now() - scanStart;
    if (elapsed < 3600) await new Promise(r => setTimeout(r, 3600 - elapsed));
    setScanProgress(100); setDoneScanSteps([0, 1, 2, 3]);
    await new Promise(r => setTimeout(r, 700));
    setOverlayExiting(true);
    await new Promise(r => setTimeout(r, 600));
    if (apiError) setError(apiError); else setResult(parsed);
    setPhase("results"); setOverlayExiting(false);
  };

  const resetAll = () => {
    setPhase("upload"); setImage(null); setImageBase64(null);
    setResult(null); setError(null); setScanProgress(0);
    setActiveScanStep(0); setDoneScanSteps([]); setUploadExiting(false);
  };

  const medCount = result?.medications?.length || 0;
  const step1Done = phase === "scanning" || phase === "results";
  const step2Active = phase === "results";

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="orb orb1" /><div className="orb orb2" />

        <header className="header">
          <div className="header-left">
            <div className="logo">⚕️</div>
            <div className="brand"><h1>RxScanner</h1><p>AI-powered medical prescription reader</p></div>
          </div>
          <div className="header-badge"><div className="pulse-dot" />Groq Vision API</div>
        </header>

        <div className="step-bar">
          <div className="step-item">
            <div className={`step-circle ${phase === "upload" ? "active" : "done"}`}>{phase === "upload" ? "01" : "✓"}</div>
            <div className="step-info"><div className="step-title">Upload</div><div className="step-sub">{phase === "upload" ? "Choose image" : "Complete"}</div></div>
          </div>
          <div className={`step-connector ${step1Done ? "active" : ""}`} />
          <div className={`step-item ${phase === "upload" ? "inactive" : ""}`}>
            <div className={`step-circle ${phase === "scanning" ? "active scanning-pulse" : phase === "results" ? "done" : ""}`}>{phase === "results" ? "✓" : "02"}</div>
            <div className="step-info"><div className="step-title">Scanning</div><div className="step-sub">{phase === "scanning" ? "Analyzing..." : phase === "results" ? "Complete" : "Waiting"}</div></div>
          </div>
          <div className={`step-connector ${step2Active ? "active" : ""}`} />
          <div className={`step-item ${phase !== "results" ? "inactive" : ""}`}>
            <div className={`step-circle ${phase === "results" ? "active" : ""}`}>03</div>
            <div className="step-info"><div className="step-title">Results</div><div className="step-sub">{phase === "results" ? medCount + " found" : "Pending"}</div></div>
          </div>
        </div>

        <div className="main-wrap">
          {phase === "upload" && (
            <div className={`upload-card${uploadExiting ? " exit" : ""}`}>
              <div className="card-hdr">
                <span className="card-lbl">Prescription Image</span>
                <span className="card-tag">Step 01 — Upload</span>
              </div>
              <div className="upload-body">
                {!image ? (
                  <div className={`drop-zone${dragging ? " dz-on" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
                    <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                    <div className="dz-icon">📋</div>
                    <div className="dz-text"><h3>Drop your prescription here</h3><p>or click to browse files</p></div>
                    <div className="fmt-chips">{["JPG","PNG","WEBP","PDF"].map(f => <span key={f} className="fchip">{f}</span>)}</div>
                  </div>
                ) : (
                  <div className="preview-wrap">
                    <img src={image} alt="Prescription" />
                    <div className="preview-lbl">✓  Image loaded — ready to scan</div>
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9.5px",textTransform:"uppercase",letterSpacing:"1.8px",color:"rgba(240,249,255,0.28)"}}>Groq API Key</label>
                  <input type="password" placeholder="gsk_..." value={apiKey} onChange={e => setApiKey(e.target.value)}
                    style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.04)",
                      border:apiKey ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius:"10px",color:"#f0f9ff",fontFamily:"'JetBrains Mono',monospace",fontSize:"13px",outline:"none"}} />
                  {!apiKey && <p style={{fontSize:"11px",color:"rgba(239,68,68,0.7)",fontFamily:"'JetBrains Mono',monospace"}}>⚠ Groq API key required — get one free at console.groq.com</p>}
                </div>
                <button className="btn-scan" onClick={scanPrescription} disabled={!image || !apiKey}><span>🔬</span> Scan Prescription</button>
                {image && <button className="btn-clear" onClick={resetAll}>Clear & upload new image</button>}
              </div>
            </div>
          )}

          {phase === "results" && (
            <div className="results-card">
              <div className="card-hdr">
                <span className="card-lbl">Extracted Medications</span>
                {result && <span className="count-pill">{medCount} medication{medCount !== 1 ? "s" : ""} found</span>}
              </div>
              <div className="results-body">
                {error && <div className="err-box"><span>⚠️</span><span>{error}</span></div>}
                {result && (
                  <>
                    <div className="stats-grid">
                      {[
                        { icon:"💊", val:medCount, lbl:"Medications" },
                        { icon:"✅", val:result.medications?.filter(m => notNull(m.dosage)).length || 0, lbl:"With dosage" },
                        { icon:"📋", val:result.medications?.filter(m => notNull(m.instructions)).length || 0, lbl:"With instructions" },
                      ].map((s, i) => (
                        <div className="stat-tile" key={i}>
                          <div className="st-icon">{s.icon}</div>
                          <div className="st-val">{s.val}</div>
                          <div className="st-lbl">{s.lbl}</div>
                        </div>
                      ))}
                    </div>

                    {notNull(result.generalNotes) && (
                      <div className="notes-box">
                        <div className="nlbl">General Notes</div>
                        <div className="ntxt">{result.generalNotes}</div>
                      </div>
                    )}

                    {(notNull(result.patientName) || notNull(result.doctorName) || notNull(result.date)) && (
                      <div className="info-box">
                        <div className="ibox-hdr">Prescription Info</div>
                        {notNull(result.patientName) && <div className="irow"><span className="ikey">Patient</span><span className="ival">{result.patientName}</span></div>}
                        {notNull(result.doctorName) && <div className="irow"><span className="ikey">Doctor</span><span className="ival">{result.doctorName}</span></div>}
                        {notNull(result.date) && <div className="irow"><span className="ikey">Date</span><span className="ival">{result.date}</span></div>}
                      </div>
                    )}

                    <div className="sec-lbl">Medications</div>

                    {result.medications && result.medications.length > 0
                      ? result.medications.map((med, i) => (
                        <div className="med-card" key={i}>
                          <div className="mc-top">
                            <div className="mc-name">{med.name}</div>
                            {notNull(med.dosage) && <div className="mc-badge">{med.dosage}</div>}
                          </div>
                          {notNull(med.description) && (
                            <div className="mc-desc">
                              <span className="mc-desc-i">ℹ</span>
                              <span>{med.description}</span>
                            </div>
                          )}
                          <div className="mc-div" />
                          <div className="mc-details">
                            {notNull(med.frequency) && <div className="mc-det"><span className="dlbl">Frequency</span><span className="dval">{med.frequency}</span></div>}
                            {notNull(med.duration) && <div className="mc-det"><span className="dlbl">Duration</span><span className="dval">{med.duration}</span></div>}
                            {notNull(med.quantity) && <div className="mc-det"><span className="dlbl">Quantity</span><span className="dval">{med.quantity}</span></div>}
                            {notNull(med.instructions) && <div className="mc-det fw"><span className="dlbl">Instructions</span><span className="dval">{med.instructions}</span></div>}
                          </div>
                        </div>
                      ))
                      : <div className="err-box"><span>⚠️</span><span>No medications could be extracted.</span></div>
                    }
                  </>
                )}
                <button className="btn-rescan" onClick={resetAll}>↩ Scan Another Prescription</button>
              </div>
            </div>
          )}
        </div>

        {phase === "scanning" && (
          <div className={`scan-overlay${overlayExiting ? " exit" : ""}`}>
            {image && (
              <div className="scan-image-wrap">
                <img src={image} alt="Scanning" />
                <div className="laser-line" />
                <div className="scan-corner sc-tl" /><div className="scan-corner sc-tr" />
                <div className="scan-corner sc-bl" /><div className="scan-corner sc-br" />
              </div>
            )}
            <div className="scan-rings-wrap">
              <div className="ring ring1" /><div className="ring ring2" /><div className="ring ring3" /><div className="ring-core" />
            </div>
            <div className="scan-prog-wrap">
              <div className="scan-prog-label">
                <span className="scan-prog-title">Scanning</span>
                <span className="scan-prog-pct">{scanProgress}%</span>
              </div>
              <div className="scan-prog-track"><div className="scan-prog-fill" style={{width: scanProgress + "%"}} /></div>
            </div>
            <div className="scan-steps">
              {SCAN_STEPS.map((s, i) => (
                <div key={i} className={"scan-step" + (activeScanStep === i && !doneScanSteps.includes(i) ? " active" : "") + (doneScanSteps.includes(i) ? " done" : "")}>
                  <span className="ss-icon">{doneScanSteps.includes(i) ? "✓" : activeScanStep === i ? s.icon : "○"}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
