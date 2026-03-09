import { useState, useCallback, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./PrescriptionScanner.css";
import "./PrescriptionScanner2.css";

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
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("vaidyadrishti_history") || "[]"); } catch (e) { return []; } });
  const [copiedId, setCopiedId] = useState(null);
  const [lang, setLang] = useState("te");
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [copyShareDone, setCopyShareDone] = useState(false);
  const [extraImages, setExtraImages] = useState([]);
  const [checking, setChecking] = useState(false);
  const [interactions, setInteractions] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 1700);
    const hideTimer = setTimeout(() => setShowSplash(false), 2200);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

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
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const animateScanSteps = () => {
    SCAN_STEPS.forEach((_, i) => {
      const delay = i * 1800;
      setTimeout(() => {
        setActiveScanStep(i);
        setScanProgress(Math.round(((i + 1) / SCAN_STEPS.length) * 85));
      }, delay);
      if (i > 0) setTimeout(() => setDoneScanSteps(prev => [...prev, i - 1]), delay);
    });
  };

  const scanPrescription = async () => {
    if (!imageBase64 || !apiKey) return;
    setUploadExiting(true);
    setTimeout(async () => {
      setPhase("scanning"); setError(null);
      setScanProgress(0); setActiveScanStep(0); setDoneScanSteps([]);
      animateScanSteps();
      const allImages = [imageBase64, ...extraImages.map(e => ({ data: e.data, type: e.type }))];
      const imgContent = allImages.map(img => ({ type: "image_url", image_url: { url: `data:${img.type};base64,${img.data}` } }));
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens: 2000,
            messages: [{
              role: "user",
              content: [
                ...imgContent,
                { type: "text", text: `Analyze this prescription image and extract ALL information. Return ONLY valid JSON, no markdown:\n{\n  "patientName": "string or null",\n  "doctorName": "string or null",\n  "date": "string or null",\n  "generalNotes": "string or null",\n  "medications": [{\n    "name": "BRAND NAME ONLY — never include dosage or strength in name field",\n    "description": "1-2 sentence plain-language explanation — NEVER null",\n    "dosage": "strength like 500mg or null",\n    "frequency": "how often or null",\n    "duration": "how long or null",\n    "instructions": "special instructions or null",\n    "quantity": "tablet count or null",\n    "confidence": 85\n  }]\n}\nRules: 1) medicine name must be brand name only, no dosage. 2) description is always filled. 3) confidence 0-100. 4) Return ONLY JSON.` }
              ]
            }]
          })
        });
        const data = await res.json();
        setScanProgress(95);
        if (data.choices) {
          let text = data.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
          const parsed = validateParsed(JSON.parse(text));
          setScanProgress(100);
          setTimeout(() => setDoneScanSteps([0, 1, 2, 3]), 400);
          setTimeout(() => {
            setOverlayExiting(true);
            setTimeout(() => { setResult(parsed); setPhase("results"); saveToHistory(parsed); setOverlayExiting(false); }, 600);
          }, 900);
        } else {
          throw new Error(data.error?.message || "Unknown error");
        }
      } catch (e) {
        setOverlayExiting(true);
        setTimeout(() => { setError(e.message); setPhase("results"); setOverlayExiting(false); }, 600);
      }
    }, 500);
  };

  const resetAll = () => { setPhase("upload"); setImage(null); setImageBase64(null); setResult(null); setError(null); setExtraImages([]); setTranslated(null); setInteractions(null); setUploadExiting(false); };

  const saveToHistory = (parsed) => {
    const entry = { id: Date.now(), patientName: parsed.patientName || "Unknown", doctorName: parsed.doctorName || "Unknown", medCount: (parsed.medications || []).length, scannedAt: new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), data: parsed };
    const updated = [entry, ...history].slice(0, 5);
    setHistory(updated);
    try { localStorage.setItem("vaidyadrishti_history", JSON.stringify(updated)); } catch (e) { }
  };

  const copyMed = (med, id) => {
    const text = ["Medicine: " + med.name, med.dosage ? "Dosage: " + med.dosage : "", med.frequency ? "Frequency: " + med.frequency : "", med.duration ? "Duration: " + med.duration : "", med.instructions ? "Instructions: " + med.instructions : ""].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  const buildReportText = () => {
    if (!result) return "";
    const lines = [];
    lines.push("VaidyaDrishti AI — Prescription Report");
    lines.push("Generated: " + new Date().toLocaleString("en-IN"));
    lines.push("━".repeat(42));
    if (notNull(result.patientName)) lines.push("Patient : " + result.patientName);
    if (notNull(result.doctorName)) lines.push("Doctor  : " + result.doctorName);
    if (notNull(result.date)) lines.push("Date    : " + result.date);
    if (notNull(result.generalNotes)) { lines.push(""); lines.push("Notes: " + result.generalNotes); }
    lines.push(""); lines.push("MEDICATIONS"); lines.push("─".repeat(30));
    (result.medications || []).forEach((med, i) => {
      lines.push("");
      lines.push((i + 1) + ". " + med.name + (notNull(med.dosage) ? " — " + med.dosage : ""));
      if (notNull(med.description)) lines.push("   " + med.description);
      if (notNull(med.frequency)) lines.push("   📅 " + med.frequency);
      if (notNull(med.duration)) lines.push("   ⏱ " + med.duration);
      if (notNull(med.quantity)) lines.push("   📦 " + med.quantity);
      if (notNull(med.instructions)) lines.push("   ⚠ " + med.instructions);
    });
    lines.push(""); lines.push("─".repeat(30));
    return lines.join("\n");
  };

  const exportReport = () => setShareModal(true);

  const doDownloadTxt = () => {
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vaidyadrishti_" + Date.now() + ".txt"; a.click();
    URL.revokeObjectURL(url);
    setShareModal(false);
  };

  const doShareWhatsApp = async () => {
    if (!resultsRef.current) return;
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: "#F8FAFC",
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector(".results-wrap");
          if (el) {
            el.style.animation = "none";
            el.style.transition = "none";
            el.style.opacity = "1";
            el.style.visibility = "visible";
            el.style.transform = "none";
            el.style.paddingBottom = "40px";
          }
          // Hide elements for a compact share image
          [".res-actions-bar", ".sb-sched", ".sb-tools", ".btn-rescan", ".navbar"].forEach(s => {
            const node = clonedDoc.querySelector(s);
            if (node) node.style.display = "none";
          });

          clonedDoc.querySelectorAll(".med-card").forEach(card => {
            card.style.background = "#ffffff";
            card.style.opacity = "1";
          });
          const hero = clonedDoc.querySelector(".res-hero");
          if (hero) {
            hero.style.background = "linear-gradient(135deg, #0F766E 0%, #0D9488 40%, #06B6D4 100%)";
            hero.style.opacity = "1";
          }
          clonedDoc.querySelectorAll(".mc-desc-band").forEach(band => {
            band.style.opacity = "1";
          });
        }
      });

      const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.95));
      const file = new File([blob], "vaidyadrishti_report.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "VaidyaDrishti AI Report",
          text: "Medical Prescription Analysis by VaidyaDrishti AI"
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "vaidyadrishti_report.jpg";
        a.click();
        URL.revokeObjectURL(url);

        const text = buildReportText();
        window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
      }
      setShareModal(false);
    } catch (e) {
      console.error("Share failed", e);
      const text = buildReportText();
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
      setShareModal(false);
    }
  };

  const doCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(buildReportText());
      setCopyShareDone(true);
      setTimeout(() => setCopyShareDone(false), 2000);
    } catch (e) { alert("Copy failed — please copy manually."); }
  };

  const escHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const validateParsed = (obj) => {
    if (!obj || typeof obj !== "object") throw new Error("Invalid response structure from AI.");
    if (!Array.isArray(obj.medications)) obj.medications = [];
    obj.medications = obj.medications.map(m => ({
      name: typeof m.name === "string" ? m.name.slice(0, 120) : "Unknown",
      description: typeof m.description === "string" ? m.description.slice(0, 500) : null,
      dosage: typeof m.dosage === "string" ? m.dosage.slice(0, 60) : null,
      frequency: typeof m.frequency === "string" ? m.frequency.slice(0, 100) : null,
      duration: typeof m.duration === "string" ? m.duration.slice(0, 100) : null,
      instructions: typeof m.instructions === "string" ? m.instructions.slice(0, 300) : null,
      quantity: typeof m.quantity === "string" ? m.quantity.slice(0, 60) : null,
      confidence: typeof m.confidence === "number" ? Math.min(100, Math.max(0, m.confidence)) : 75,
    }));
    obj.patientName = typeof obj.patientName === "string" ? obj.patientName.slice(0, 120) : null;
    obj.doctorName = typeof obj.doctorName === "string" ? obj.doctorName.slice(0, 120) : null;
    obj.date = typeof obj.date === "string" ? obj.date.slice(0, 60) : null;
    obj.generalNotes = typeof obj.generalNotes === "string" ? obj.generalNotes.slice(0, 600) : null;
    return obj;
  };

  const doPrint = () => {
    const w = window.open("", "_blank", "width=700,height=900");
    if (!w) { alert("Popup blocked — please allow popups for this site."); return; }
    const meds = (result.medications || []);
    const e = escHtml;
    const medRows = meds.map((med, i) => `
      <div class="med-block">
        <div class="med-num">Rx ${String(i + 1).padStart(2, "0")}</div>
        <div class="med-name">${e(med.name)}${notNull(med.dosage) ? ' <span class="dosage">' + e(med.dosage) + '</span>' : ''}</div>
        ${notNull(med.description) ? '<div class="med-desc">' + e(med.description) + '</div>' : ''}
        <div class="med-grid">
          ${notNull(med.frequency) ? '<div><b>Frequency</b><br>' + e(med.frequency) + '</div>' : ''}
          ${notNull(med.duration) ? '<div><b>Duration</b><br>' + e(med.duration) + '</div>' : ''}
          ${notNull(med.quantity) ? '<div><b>Quantity</b><br>' + e(med.quantity) + '</div>' : ''}
          ${notNull(med.instructions) ? '<div style="grid-column:span 3"><b>Instructions</b><br>' + e(med.instructions) + '</div>' : ''}
        </div>
      </div>`).join('');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
    <title>VaidyaDrishti Report</title>
    <style>
      body { font-family: Georgia, serif; max-width: 680px; margin: 32px auto; color: #1a1a2e; }
      h1 { font-size: 22px; color: #0F766E; border-bottom: 2px solid #0F766E; padding-bottom: 8px; margin-bottom: 4px; }
      .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
      .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .info-table td { padding: 6px 10px; border: 1px solid #ddd; font-size: 13px; }
      .info-table td:first-child { font-weight: bold; background: #F0FDFA; width: 30%; }
      .notes { background: #F0FDFA; border-left: 4px solid #0F766E; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin-bottom: 24px; }
      .sec-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #0F766E; margin-bottom: 14px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
      .med-block { border: 1px solid #E2E8F0; border-left: 4px solid #0F766E; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; }
      .med-num { font-size: 10px; font-family: monospace; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2px; }
      .med-name { font-size: 18px; font-weight: bold; color: #0F172A; margin-bottom: 6px; }
      .dosage { font-size: 12px; background: #ECFDF5; color: #0F766E; padding: 2px 8px; border-radius: 6px; margin-left: 8px; font-family: monospace; }
      .med-desc { font-size: 12.5px; color: #555; margin-bottom: 8px; font-style: italic; }
      .med-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px; }
      .med-grid div { background: #F8FAFC; padding: 7px 9px; border-radius: 6px; }
      .med-grid b { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 2px; }
      .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; }
      @media print { body { margin: 16px; } }
    </style></head><body>
    <h1>📋 Prescription Report</h1>
    <div class="meta">Generated by VaidyaDrishti AI &middot; ${e(new Date().toLocaleString("en-IN"))}</div>
    ${notNull(result.patientName) || notNull(result.doctorName) || notNull(result.date) ? `
    <table class="info-table">
      ${notNull(result.patientName) ? '<tr><td>Patient</td><td>' + e(result.patientName) + '</td></tr>' : ''}
      ${notNull(result.doctorName) ? '<tr><td>Doctor</td><td>' + e(result.doctorName) + '</td></tr>' : ''}
      ${notNull(result.date) ? '<tr><td>Date</td><td>' + e(result.date) + '</td></tr>' : ''}
    </table>` : ''}
    ${notNull(result.generalNotes) ? '<div class="notes">' + e(result.generalNotes) + '</div>' : ''}
    <div class="sec-title">Medications (${meds.length})</div>
    ${medRows}
    <div class="footer">For informational use only</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
    setShareModal(false);
  };

  const buildSchedule = (medications) => {
    const slots = { Morning: [], Afternoon: [], Night: [] };
    (medications || []).forEach(med => {
      if (!notNull(med.name)) return;
      const freq = (med.frequency || "").toLowerCase();
      const dose = notNull(med.dosage) ? med.dosage : "";
      const entry = { name: med.name, dose };
      if (freq.includes("once") || freq.includes("1")) { slots.Morning.push(entry); }
      else if (freq.includes("twice") || freq.includes("2")) { slots.Morning.push(entry); slots.Night.push(entry); }
      else if (freq.includes("three") || freq.includes("3") || freq.includes("thrice")) { slots.Morning.push(entry); slots.Afternoon.push(entry); slots.Night.push(entry); }
      else { slots.Morning.push(entry); }
    });
    return slots;
  };

  const translateResult = async () => {
    if (!result || !apiKey) return;
    setTranslating(true); setTranslated(null);
    const langNames = { te: "Telugu", hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi" };
    try {
      const summary = "Patient: " + (result.patientName || "N/A") + "\nDoctor: " + (result.doctorName || "N/A") + "\nDate: " + (result.date || "N/A") + (notNull(result.generalNotes) ? "\nNotes: " + result.generalNotes + "\n" : "") + "\nMedications:\n" + (result.medications || []).map((m, i) => (i + 1) + ". " + m.name + (notNull(m.dosage) ? " " + m.dosage : "") + (notNull(m.frequency) ? ", " + m.frequency : "") + (notNull(m.duration) ? ", for " + m.duration : "") + (notNull(m.instructions) ? " — " + m.instructions : "")).join("\n");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
        body: JSON.stringify({ model: "meta-llama/llama-4-scout-17b-16e-instruct", max_tokens: 1500, messages: [{ role: "user", content: "Translate the following prescription summary into " + langNames[lang] + ". Keep medicine names in English. Return only the translation:\n\n" + summary }] })
      });
      const data = await res.json();
      if (data.choices) setTranslated(data.choices[0].message.content);
    } catch (e) { setTranslated("Translation failed. Please try again."); }
    setTranslating(false);
  };

  const addExtraPage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setExtraImages(prev => [...prev, { url: URL.createObjectURL(file), data: e.target.result.split(",")[1], type: file.type }]);
    };
    reader.readAsDataURL(file);
  };
  const removeExtraPage = (idx) => setExtraImages(prev => prev.filter((_, i) => i !== idx));

  const checkInteractions = async () => {
    if (!result || !result.medications || result.medications.length < 2) return;
    setChecking(true); setInteractions(null);
    const names = result.medications.map(m => m.name).join(", ");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
        body: JSON.stringify({ model: "meta-llama/llama-4-scout-17b-16e-instruct", max_tokens: 800, messages: [{ role: "user", content: "Check for drug interactions between: " + names + ". Return ONLY JSON (no markdown): {interactions:[{drug1,drug2,severity,description}],safe:boolean}. If none, return {interactions:[],safe:true}." }] })
      });
      const data = await res.json();
      if (data.choices) {
        let text = data.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
        const ix = JSON.parse(text);
        if (!ix || typeof ix !== "object") throw new Error("Bad interactions response");
        if (!Array.isArray(ix.interactions)) ix.interactions = [];
        setInteractions(ix);
      }
    } catch (e) { setInteractions({ interactions: [], safe: true, error: true }); }
    setChecking(false);
  };

  const getConfColor = (score) => {
    if (score >= 85) return "var(--secondary)";
    if (score >= 60) return "var(--primary)";
    return "var(--accent)";
  };

  const medCount = result?.medications?.length || 0;
  const step1Done = phase === "scanning" || phase === "results";
  const step2Active = phase === "results";

  return (
    <>
      {/* ══ SPLASH SCREEN ══ */}
      {showSplash && (
        <div className={`splash-screen${splashFading ? " splash-fade" : ""}`}>
          <div className="splash-particles">
            {[...Array(6)].map((_, i) => <div key={i} className="splash-particle" />)}
          </div>
          <div className="splash-ecg-wrap">
            <svg className="splash-ecg" viewBox="0 0 800 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="40%" stopColor="#22C55E" />
                  <stop offset="50%" stopColor="#4ADE80" />
                  <stop offset="60%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <filter id="ecgGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <polyline
                className="splash-ecg-line"
                fill="none" stroke="url(#ecgGrad)" strokeWidth="2.5"
                filter="url(#ecgGlow)"
                points="0,60 80,60 120,60 160,60 200,60 230,60 250,58 265,62 280,55 295,65 310,30 320,95 330,10 340,90 350,40 360,60 380,60 420,60 460,60 500,60 530,60 550,58 565,62 580,55 595,65 610,30 620,95 630,10 640,90 650,40 660,60 680,60 720,60 760,60 800,60"
              />
            </svg>
          </div>
          <div className="splash-content">
            <div className="splash-logo">👁</div>
            <h1 className="splash-title">Medical Scanner <span>AI</span></h1>
            <p className="splash-subtitle">Initializing system...</p>
            <div className="splash-loader"><div className="splash-loader-fill" /></div>
          </div>
        </div>
      )}

      <div className={`app${showSplash ? " app-hidden" : ""}`}>

        {/* ══ NAVBAR ══ */}
        <nav className="navbar">
          <div className="nav-brand" onClick={resetAll} style={{ cursor: "pointer" }}>
            <div className="nav-logo">👁</div>
            <div className="nav-title">Vaidya<span>Drishti</span></div>
          </div>
          <div className="nav-links">
            <button className={`nav-link${phase === "upload" ? " active" : ""}`} onClick={resetAll}>Home</button>
          </div>
        </nav>

        {/* ══ HERO (only on upload) ══ */}
        {phase === "upload" && (
          <section className="hero">
            <div className="hero-content">
              <div className="hero-badge">✨ AI-Powered Analysis</div>
              <h1>
                <span className="gradient-text">AI Powered</span> Medical<br />Prescription Scanner
              </h1>
              <p>Upload medical prescriptions and receive intelligent AI-powered scan analysis with medication details, dosage, and scheduling — instantly.</p>
              <div className="hero-actions">
                <button className="btn-secondary" onClick={() => document.querySelector('.features-section')?.scrollIntoView({ behavior: 'smooth' })}>Learn More ↓</button>
              </div>
            </div>
          </section>
        )}

        {/* ══ STEP BAR ══ */}
        <div style={{ padding: phase === "upload" ? "28px 0 0" : "28px 0 0" }}>
          <div className="step-bar">
            <div className="step-item">
              <div className={`step-num ${phase === "upload" ? "active" : "done"}`}>{phase === "upload" ? "01" : "✓"}</div>
              <div className="step-label">Upload</div>
            </div>
            <div className={`step-line ${step1Done ? "active" : ""}`} />
            <div className={`step-item ${phase === "upload" ? "inactive" : ""}`}>
              <div className={`step-num ${phase === "scanning" ? "active scanning-pulse" : phase === "results" ? "done" : ""}`}>{phase === "results" ? "✓" : "02"}</div>
              <div className="step-label">Scan</div>
            </div>
            <div className={`step-line ${step2Active ? "active" : ""}`} />
            <div className={`step-item ${phase !== "results" ? "inactive" : ""}`}>
              <div className={`step-num ${phase === "results" ? "active" : ""}`}>03</div>
              <div className="step-label">Results</div>
            </div>
          </div>
        </div>

        {/* ══ MAIN ══ */}
        <div className="main-wrap">

          {/* UPLOAD PHASE */}
          {phase === "upload" && (
            <div className={`card${uploadExiting ? " exit" : ""}`}>
              <div className="card-hdr">
                <span className="card-lbl">Prescription Image</span>
                <span className="card-tag">Step 01</span>
              </div>
              <div className="card-body">
                {!image ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label className="btn-camera">
                      <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
                      <span className="btn-camera-icon">📷</span>
                      <div>
                        <div className="btn-camera-title">Take Photo</div>
                        <div className="btn-camera-sub">Use camera to capture prescription</div>
                      </div>
                    </label>
                    <div className="upload-or"><span>or</span></div>
                    <div className={`drop-zone${dragging ? " dz-on" : ""}`}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
                      <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                      <div className="dz-icon-wrap">📂</div>
                      <div>
                        <div className="dz-title">Upload from Gallery</div>
                        <div className="dz-sub">Drag & drop or click to browse</div>
                      </div>
                      <div className="fmt-chips">{["JPG", "PNG", "WEBP"].map(f => <span key={f} className="fchip">{f}</span>)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-wrap">
                    <img src={image} alt="Prescription" />
                    <div className="preview-lbl">✓ Image loaded — ready to scan</div>
                  </div>
                )}

                {history.length > 0 && (
                  <div>
                    <div className="hist-hdr">
                      <span className="hist-title">Recent Scans</span>
                      <button className="btn-clr-hist" onClick={() => { setHistory([]); localStorage.removeItem("vaidyadrishti_history"); }}>Clear</button>
                    </div>
                    <div className="hist-list">
                      {history.slice(0, 5).map(h => (
                        <div className="hist-item" key={h.id} onClick={() => { setResult(h.data); setPhase("results"); }}>
                          <div>
                            <div className="hist-patient">{h.patientName}</div>
                            <div className="hist-meta">{h.doctorName} · {h.scannedAt}</div>
                          </div>
                          <span className="hist-badge">{h.medCount} meds</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {image && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="pages-lbl">
                      <span>Pages</span>
                      <span className="page-badge">{1 + extraImages.length} page{(1 + extraImages.length) > 1 ? "s" : ""}</span>
                    </div>
                    <div className="thumbs-row">
                      <div className="thumb-wrap"><img src={image} alt="p1" /></div>
                      {extraImages.map((img, i) => (
                        <div className="thumb-wrap" key={i}>
                          <img src={img.url} alt={"p" + (i + 2)} />
                          <button className="thumb-del" onClick={() => removeExtraPage(i)}>✕</button>
                        </div>
                      ))}
                      <label className="btn-add-thumb" title="Add page">
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) addExtraPage(e.target.files[0]); e.target.value = ""; }} />
                        +
                      </label>
                    </div>
                  </div>
                )}

                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }} tabIndex={-1} aria-hidden="true" />
                <button className="btn-primary full" onClick={scanPrescription} disabled={!image}><span>🔬</span> Analyze Prescription</button>
                {image && <button className="btn-ghost" onClick={resetAll}>✕ Clear</button>}
              </div>
            </div>
          )}

          {/* RESULTS PHASE */}
          {phase === "results" && (
            <div className="results-wrap" ref={resultsRef}>
              {error ? (
                <div className="err-box"><span>⚠️</span><span>{error}</span></div>
              ) : result && (
                <>
                  <div className="res-hero">
                    <div className="res-hero-top">
                      <div className="res-hero-title-group">
                        <div className="res-hero-icon">📋</div>
                        <div>
                          <div className="res-hero-title">Prescription Analysis</div>
                          <div className="res-hero-sub">VAIDYADRISHTI AI · GROQ VISION</div>
                        </div>
                      </div>
                      <div className="res-hero-badges">
                        <div className="res-pill-done"><div className="res-pill-dot" />Scan Complete</div>
                        <div className="res-pill-model">Llama 4 Scout</div>
                      </div>
                    </div>
                    <div className="res-stats">
                      <div className="res-stat"><div className="res-stat-icon">💊</div><div className="res-stat-num">{medCount}</div><div className="res-stat-lbl">Medications</div></div>
                      <div className="res-stat"><div className="res-stat-icon">📏</div><div className="res-stat-num">{(result.medications || []).filter(m => notNull(m.dosage)).length}</div><div className="res-stat-lbl">With Dosage</div></div>
                      <div className="res-stat"><div className="res-stat-icon">🗓️</div><div className="res-stat-num">{(result.medications || []).filter(m => notNull(m.frequency)).length}</div><div className="res-stat-lbl">Scheduled</div></div>
                      <div className="res-stat"><div className="res-stat-icon">🎯</div><div className="res-stat-num">{Math.round((result.medications || []).reduce((s, m) => s + (m.confidence || 0), 0) / Math.max(medCount, 1))}%</div><div className="res-stat-lbl">Avg Confidence</div></div>
                    </div>
                  </div>

                  <div className="res-actions-bar">
                    <button className="btn-action" onClick={exportReport}>📄 Export Report</button>
                    <button className="btn-rescan" style={{ width: "auto", marginTop: 0 }} onClick={resetAll}>↩ New Scan</button>
                  </div>

                  <div className="res-body">
                    <div className="res-med-col">
                      <div className="res-col-hdr">💊 Medications<span className="res-col-count">{medCount} found</span></div>
                      {(result.medications || []).length > 0
                        ? (result.medications || []).map((med, i) => (
                          <div className="med-card" key={i}>
                            <div className="med-card-strip" />
                            <div className="mc-hdr">
                              <div className="mc-hdr-left">
                                <div className="mc-num">Rx — {String(i + 1).padStart(2, "0")}</div>
                                <div className="mc-name">{med.name}</div>
                                <div className="mc-tags">
                                  {notNull(med.dosage) && <span className="mc-dose-badge">{med.dosage}</span>}
                                  <a className="btn-search" href={"https://www.1mg.com/search/all?name=" + encodeURIComponent(med.name)} target="_blank" rel="noopener noreferrer">🛒 1mg</a>
                                  <a className="btn-search" href={"https://www.netmeds.com/catalogsearch/result?q=" + encodeURIComponent(med.name)} target="_blank" rel="noopener noreferrer">🛒 Netmeds</a>
                                </div>
                              </div>
                              <div className="mc-hdr-right">
                                <button className={`btn-sm${copiedId === i ? " copied" : ""}`} onClick={() => copyMed(med, i)}>{copiedId === i ? "✓ Copied" : "📋 Copy"}</button>
                              </div>
                            </div>
                            {notNull(med.description) && <div className="mc-desc-band">{med.description}</div>}
                            {(notNull(med.frequency) || notNull(med.duration) || notNull(med.quantity)) && (
                              <div className="mc-detail-grid">
                                {notNull(med.frequency) && <div className={`mc-detail-cell${!notNull(med.duration) && !notNull(med.quantity) ? " span3" : !notNull(med.duration) || !notNull(med.quantity) ? " span2" : ""}`}><div className="mc-det-key">Frequency</div><div className="mc-det-val">{med.frequency}</div></div>}
                                {notNull(med.duration) && <div className="mc-detail-cell"><div className="mc-det-key">Duration</div><div className="mc-det-val">{med.duration}</div></div>}
                                {notNull(med.quantity) && <div className="mc-detail-cell"><div className="mc-det-key">Quantity</div><div className="mc-det-val">{med.quantity}</div></div>}
                              </div>
                            )}
                            {notNull(med.instructions) && <div className="mc-instructions-strip"><div className="mc-instr-lbl">⚠ Special Instructions</div><div className="mc-instr-txt">{med.instructions}</div></div>}
                            {med.confidence != null && (
                              <div className="mc-conf">
                                <span className="mc-conf-lbl">AI Confidence</span>
                                <div className="mc-conf-track"><div className="mc-conf-fill" style={{ width: med.confidence + "%", background: getConfColor(med.confidence) }} /></div>
                                <span className="mc-conf-pct">{med.confidence}%</span>
                              </div>
                            )}
                          </div>
                        ))
                        : <div className="err-box"><span>⚠️</span><span>No medications could be extracted.</span></div>
                      }
                    </div>

                    <div className="res-sidebar">
                      {(notNull(result.patientName) || notNull(result.doctorName) || notNull(result.date)) && (
                        <div className="sb-card sb-patient">
                          <div className="sb-card-hdr"><span className="sb-card-hdr-icon">🏥</span><span className="sb-card-hdr-title">Prescription Info</span></div>
                          <div className="sb-card-body">
                            {notNull(result.patientName) && <div className="sb-field"><div className="sb-field-key">Patient</div><div className="sb-field-val">{result.patientName}</div></div>}
                            {notNull(result.doctorName) && <div className="sb-field"><div className="sb-field-key">Doctor</div><div className="sb-field-val">{result.doctorName}</div></div>}
                            {notNull(result.date) && <div className="sb-field"><div className="sb-field-key">Date</div><div className="sb-field-val">{result.date}</div></div>}
                          </div>
                        </div>
                      )}

                      {notNull(result.generalNotes) && (
                        <div className="sb-card sb-notes">
                          <div className="sb-card-hdr"><span className="sb-card-hdr-icon">📝</span><span className="sb-card-hdr-title">General Notes</span></div>
                          <div className="sb-card-body"><div className="sb-notes-txt">{result.generalNotes}</div></div>
                        </div>
                      )}

                      {(result.medications || []).length > 0 && (
                        <div className="sb-card sb-sched">
                          <div className="sb-card-hdr"><span className="sb-card-hdr-icon">🕐</span><span className="sb-card-hdr-title">Daily Schedule</span></div>
                          <div className="sb-card-body" style={{ gap: "0" }}>
                            {Object.entries(buildSchedule(result.medications)).map(([slot, meds]) => (
                              <div className="sb-sched-slot" key={slot}>
                                <div className="sb-slot-time">{slot === "Morning" ? "🌅 Morning" : slot === "Afternoon" ? "☀️ Afternoon" : "🌙 Night"}</div>
                                <div className="sb-slot-items">
                                  {meds.length === 0
                                    ? <div className="sb-slot-empty">No medications</div>
                                    : meds.map((m, i) => <div className="sb-slot-med" key={i}><span className="sb-slot-dose">{m.dose || "•"}</span>{m.name}</div>)
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="sb-card sb-tools">
                        <div className="sb-card-hdr"><span className="sb-card-hdr-icon">🛠</span><span className="sb-card-hdr-title">Smart Tools</span></div>
                        <div className="sb-card-body">
                          {(result.medications || []).length >= 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <button className="btn-danger" onClick={checkInteractions} disabled={checking}>
                                {checking ? "⏳ Checking..." : "⚠️ Check Drug Interactions"}
                              </button>
                              {interactions && (
                                <div className="int-box">
                                  <div className="int-hdr">Interactions</div>
                                  {interactions.safe && interactions.interactions.length === 0
                                    ? <div className="int-safe">✅ No interactions found.</div>
                                    : (interactions.interactions || []).map((ix, i) => (
                                      <div className="int-item" key={i}>
                                        <div className="int-pair">{ix.drug1} ↔ {ix.drug2} · {ix.severity || "moderate"}</div>
                                        {ix.description}
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div className="translate-row">
                              <select className="lang-select" value={lang} onChange={e => { setLang(e.target.value); setTranslated(null); }}>
                                <option value="te">Telugu</option>
                                <option value="hi">Hindi</option>
                                <option value="ta">Tamil</option>
                                <option value="bn">Bengali</option>
                                <option value="mr">Marathi</option>
                              </select>
                              <button className="btn-action" onClick={translateResult} disabled={translating}>
                                {translating ? "⏳..." : "🌐 Translate"}
                              </button>
                            </div>
                            {translated && (
                              <div className="translated-box">
                                <div className="trans-hdr">Translation</div>
                                <div className="trans-txt">{translated}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: "8px" }}>
                    <button className="btn-rescan" onClick={resetAll}>↩ Scan Another Prescription</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ══ SHARE MODAL ══ */}
        {shareModal && (
          <div className="share-modal-backdrop" onClick={() => setShareModal(false)}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
              <div className="share-modal-hdr">
                <div className="share-modal-title">Share Report</div>
                <button className="share-modal-close" onClick={() => setShareModal(false)}>✕</button>
              </div>
              <div className="share-modal-sub">Choose how to export your report</div>
              <div className="share-options">
                <button className="share-option opt-wa" onClick={doShareWhatsApp}>
                  <span className="share-opt-icon">💬</span>
                  <div><div className="share-opt-label">Share on WhatsApp</div><div className="share-opt-sub">Send full report as a message</div></div>
                </button>
                <button className="share-option opt-print" onClick={doPrint}>
                  <span className="share-opt-icon">🖨️</span>
                  <div><div className="share-opt-label">Print / Save as PDF</div><div className="share-opt-sub">Print or export formatted PDF</div></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ SCAN OVERLAY ══ */}
        {phase === "scanning" && (
          <div className={`scan-overlay${overlayExiting ? " exit" : ""}`}>
            <div className="scan-particles">
              {[...Array(8)].map((_, i) => <div key={i} className="sp" />)}
            </div>
            <div className="so-left">
              <div className="so-hex-grid">
                <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hexPat" x="0" y="0" width="52" height="60" patternUnits="userSpaceOnUse">
                      <polygon points="26,2 50,15 50,45 26,58 2,45 2,15" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="400" height="600" fill="url(#hexPat)" />
                  {[[52, 30], [156, 30], [260, 30], [104, 90], [208, 90], [52, 150], [312, 90], [156, 150], [260, 150], [104, 210], [208, 210], [52, 270], [312, 210], [26, 330], [130, 330], [234, 330], [338, 330]].map(([x, y], i) => (
                    <polygon key={i} points={`${x + 24},${y} ${x + 48},${y + 13} ${x + 48},${y + 43} ${x + 24},${y + 56} ${x},${y + 43} ${x},${y + 13}`}
                      fill={`rgba(34,197,94,${0.02 + (i % 4) * 0.015})`} stroke="none"
                      style={{ animation: `hexFade ${2 + (i % 3) * 0.7}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </svg>
              </div>
              {image && (
                <div className="scan-frame">
                  <img src={image} alt="Scanning" />
                  <div className="scan-beam" />
                  <div className="scan-corner sc-tl" /><div className="scan-corner sc-tr" />
                  <div className="scan-corner sc-bl" /><div className="scan-corner sc-br" />
                </div>
              )}
              <div className="so-dial">
                <div className="so-dial-ripple" />
                <div className="so-dial-ripple" style={{ animationDelay: "1s" }} />
                <div className="so-dial-outer" />
                <div className="so-dial-mid" />
                <div className="so-dial-inner" />
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="so-dial-tick" style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-52px)`,
                    opacity: i % 3 === 0 ? 0.8 : 0.3,
                    height: i % 3 === 0 ? "10px" : "6px"
                  }} />
                ))}
                <div className="so-dial-core" />
              </div>
              <div className="so-brand">
                <span className="so-brand-name">VaidyaDrishti AI</span>
                <span className="so-brand-sub">विश्लेषण · Analyzing</span>
              </div>
            </div>
            <div className="so-right">
              <div className="so-terminal">
                <div className="so-terminal-bar">
                  <div className="so-term-dot" /><div className="so-term-dot" /><div className="so-term-dot" />
                  <span className="so-term-title">vaidyadrishti — scan.log</span>
                </div>
                <div className="so-terminal-body">
                  <div className="so-log-line"><span className="so-log-ts">[00:00]</span><span className="so-log-ok">✓ INIT</span><span className="so-log-txt">Vision engine loaded</span></div>
                  <div className="so-log-line"><span className="so-log-ts">[00:01]</span><span className="so-log-run">⟳ PROC</span><span className="so-log-txt">Decoding image buffer</span></div>
                  <div className="so-log-line"><span className="so-log-ts">[00:02]</span><span className="so-log-inf">◈ INFO</span><span className="so-log-txt">Groq API — model ready</span></div>
                  <div className="so-log-line"><span className="so-log-ts">[00:03]</span><span className="so-log-run">⟳ SCAN</span><span className="so-log-txt">Extracting text regions</span></div>
                  <div className="so-log-line"><span className="so-log-ts">[00:04]</span><span className="so-log-run">⟳ ANLY</span><span className="so-log-txt">Parsing medication names</span></div>
                  <div className="so-log-line"><span className="so-log-ts">[00:05]</span><span className="so-log-ok">✓ DONE</span><span className="so-log-txt">Dosage patterns matched</span></div>
                  <div className="so-log-line"><span className="so-log-ts">[00:06]</span><span className="so-log-inf">◈ OUT&nbsp;</span><span className="so-log-txt">Compiling results<span className="so-cursor" /></span></div>
                </div>
              </div>
              <div className="so-prog">
                <div className="so-prog-top">
                  <span className="so-prog-lbl">Analysis</span>
                  <span className="so-prog-pct">{scanProgress}%</span>
                </div>
                <div className="so-prog-track">
                  <div className="so-prog-fill" style={{ width: scanProgress + "%" }} />
                </div>
              </div>
              <div className="so-steps">
                {SCAN_STEPS.map((s, i) => (
                  <div key={i} className={"so-step" + (activeScanStep === i && !doneScanSteps.includes(i) ? " active" : "") + (doneScanSteps.includes(i) ? " done" : "")}>
                    <span className="so-step-ico">{doneScanSteps.includes(i) ? "✓" : activeScanStep === i ? s.icon : "○"}</span>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ FEATURES SECTION (upload phase only) ══ */}
        {phase === "upload" && (
          <section className="features-section">
            <div className="features-inner">
              <div className="features-title">Why VaidyaDrishti AI?</div>
              <div className="features-sub">Powerful AI features designed for modern healthcare</div>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🧠</div>
                  <div className="feature-name">AI Image Analysis</div>
                  <div className="feature-desc">Advanced vision model reads handwritten and printed prescriptions</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-name">Instant Diagnosis</div>
                  <div className="feature-desc">Get medication details, dosage, and scheduling in seconds</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-name">Secure Data</div>
                  <div className="feature-desc">Images processed in-browser. No data stored on external servers</div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-name">High Accuracy</div>
                  <div className="feature-desc">Confidence scoring per medication with smart validation</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══ FOOTER ══ */}
        <footer className="app-footer">
          <div className="footer-inner" style={{ justifyContent: "center" }}>
            <div className="footer-left" style={{ flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div className="footer-logo">👁</div>
              <div>
                <div className="footer-brand">VaidyaDrishti <span>AI</span></div>
                <div className="footer-copy">वैद्यदृष्टि · Prescription Vision</div>
              </div>
            </div>
          </div>
          <div className="footer-disclaimer">
            © {new Date().getFullYear()} VaidyaDrishti AI · For informational use only · Not a substitute for professional medical advice · Always consult your doctor or pharmacist
          </div>
        </footer>

      </div>
    </>
  );
}
