import { useState, useCallback, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Merriweather:ital,wght@0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #e8eef5;
    --surface:    #f4f8fb;
    --surface2:   #eaf0f7;
    --surface3:   #dde6f0;
    --border:     rgba(0,60,120,0.1);
    --border2:    rgba(0,60,120,0.18);
    --accent:     #0055a4;
    --accent2:    #1976d2;
    --gold:       #00695c;
    --gold2:      #00897b;
    --teal:       #006080;
    --red:        #c62828;
    --text:       #0a1628;
    --text-dim:   rgba(10,22,40,0.65);
    --text-faint: rgba(10,22,40,0.40);
    --glow-a:     rgba(0,85,164,0.18);
    --glow-g:     rgba(0,105,92,0.15);
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; overflow-x: hidden; color: var(--text); }

  /* ── APP SHELL ── */
  .app {
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }
  .app::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 50% at 0% 0%, rgba(0,85,164,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 100% 100%, rgba(0,105,92,0.08) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,85,164,0.04) 0%, transparent 70%),
      repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(0,85,164,0.05) 48px),
      repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(0,85,164,0.05) 48px);
  }

  /* ── HEADER ── */
  .header {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(16px, 4vw, 48px);
    height: 64px;
    background: linear-gradient(135deg, #0a2547 0%, #0d3060 50%, #0a2547 100%);
    border-bottom: 2px solid rgba(255,255,255,0.08);
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .logo {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, #0055a4, #003d7a);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 14px rgba(0,102,204,0.3);
  }
  .brand-name {
    font-family: 'Merriweather', serif;
    font-size: clamp(16px, 2.5vw, 20px);
    font-weight: 700; color: #ffffff; letter-spacing: -0.3px;
  }
  .brand-name span { color: #7ec8ff; font-style: italic; }
  .brand-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 1px; letter-spacing: 0.5px;
  }
  .header-pill {
    display: flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 99px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.85);
  }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #4cdd8a; box-shadow: 0 0 8px rgba(76,221,138,0.7);
    animation: livePulse 2s ease-in-out infinite;
  }
  @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.8);} }

  /* ── STEP PROGRESS ── */
  .step-bar {
    display: flex; align-items: center;
    max-width: 520px; margin: 28px auto 0;
    padding: 0 clamp(16px,4vw,32px);
  }
  .step-item { display: flex; align-items: center; gap: 8px; flex: 1; transition: opacity 0.4s; }
  .step-item.inactive { opacity: 0.3; }
  .step-num {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600;
    border: 1px solid rgba(0,102,204,0.2); background: #f0f4f8; color: var(--text-faint);
    transition: all 0.4s;
  }
  .step-num.active {
    background: #0066cc; border-color: #0066cc; color: #fff;
    box-shadow: 0 0 16px rgba(0,102,204,0.35);
  }
  .step-num.done { background: rgba(0,102,204,0.1); border-color: rgba(0,102,204,0.3); color: #0066cc; }
  .step-num.scanning-pulse { animation: stepGlow 1s ease-in-out infinite; }
  @keyframes stepGlow { 0%,100%{box-shadow:0 0 16px rgba(0,102,204,0.4);} 50%{box-shadow:0 0 28px rgba(0,102,204,0.7);} }
  .step-label { font-size: 12px; font-weight: 500; color: var(--text-dim); }
  .step-line { flex: 1; height: 1px; background: var(--border); margin: 0 10px; position: relative; overflow: hidden; max-width: 60px; }
  .step-line.active::after { content:''; position:absolute; inset:0; background: linear-gradient(90deg, #0066cc, #00875a); animation: lineFill 0.6s ease forwards; }
  @keyframes lineFill { from{width:0%} to{width:100%} }

  /* ── MAIN WRAP ── */
  .main-wrap {
    position: relative; z-index: 5;
    max-width: 860px; margin: 24px auto 0;
    padding: 0 clamp(12px, 4vw, 28px);
    padding-bottom: 80px;
  }

  /* ── FOOTER ── */
  .app-footer {
    position: relative; z-index: 5;
    padding: 24px clamp(12px, 4vw, 48px) 28px;
    border-top: 2px solid rgba(255,255,255,0.06);
    background: linear-gradient(135deg, #0a2547 0%, #0d3060 50%, #0a2547 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    margin-top: 40px;
  }
  .footer-inner {
    max-width: 860px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
  }
  .footer-left { display: flex; align-items: center; gap: 10px; }
  .footer-logo {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .footer-brand {
    font-family: 'Merriweather', serif; font-size: 13px;
    font-weight: 700; color: #ffffff;
  }
  .footer-brand span { color: #4db8ff; font-style: italic; }
  .footer-copy {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: rgba(255,255,255,0.45); letter-spacing: 0.5px;
  }
  .footer-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .footer-tag {
    display: flex; align-items: center; gap: 5px;
    font-family: 'IBM Plex Mono', monospace; font-size: 10px;
    color: rgba(255,255,255,0.5); letter-spacing: 0.5px;
  }
  .footer-tag-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .footer-divider { width: 1px; height: 12px; background: rgba(255,255,255,0.15); }
  .footer-disclaimer {
    width: 100%; padding-top: 14px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-family: 'IBM Plex Mono', monospace; font-size: 9px;
    color: var(--text-faint); text-align: center; line-height: 1.7;
    letter-spacing: 0.3px; margin-top: 14px; color: rgba(255,255,255,0.38);
  }
  @media(max-width:600px){
    .footer-inner { flex-direction: column; align-items: flex-start; gap: 8px; }
    .footer-disclaimer { text-align: left; }
  }

  /* ── CARDS ── */
  .card {
    background: var(--surface);
    border: 1px solid rgba(0,60,120,0.12);
    border-radius: 14px; overflow: hidden; position: relative;
    box-shadow: 0 2px 20px rgba(0,40,100,0.10), 0 1px 4px rgba(0,0,0,0.05);
    transition: all 0.4s;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #0055a4, #006080, #00695c);
  }
  .card.exit { animation: cardExit 0.45s ease forwards; }
  @keyframes cardExit { to { opacity:0; transform: scale(0.96) translateY(-16px); } }
  @keyframes cardEnter { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
  .card-enter { animation: cardEnter 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .card-hdr {
    padding: 14px 20px 13px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .card-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-faint); flex: 1; }
  .card-tag {
    font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; padding: 3px 10px;
    border-radius: 99px; background: rgba(0,85,164,0.08);
    border: 1px solid rgba(0,85,164,0.2); color: #0055a4;
  }
  .card-body { padding: clamp(16px,3vw,24px); display: flex; flex-direction: column; gap: 14px; }

  /* ── DROP ZONE ── */
  .drop-zone {
    position: relative; border: 2px dashed rgba(0,85,164,0.28); border-radius: 14px;
    padding: clamp(36px,6vw,56px) 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    cursor: pointer; transition: all 0.3s; background: rgba(0,85,164,0.03);
  }
  .drop-zone:hover, .drop-zone.dz-on {
    border-color: #0055a4; background: rgba(0,85,164,0.07);
    box-shadow: 0 0 0 4px rgba(0,85,164,0.07), inset 0 0 40px rgba(0,85,164,0.04);
  }
  .drop-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; }
  .dz-icon-wrap {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(0,85,164,0.08); border: 2px solid rgba(0,85,164,0.22);
    display: flex; align-items: center; justify-content: center; font-size: 28px;
    box-shadow: 0 4px 20px rgba(0,85,164,0.14);
  }
  .dz-title { font-size: 15px; font-weight: 600; color: var(--text); text-align: center; }
  .dz-sub { font-size: 12px; color: var(--text-faint); text-align: center; }
  .fmt-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .fchip {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; padding: 3px 9px;
    border-radius: 6px; background: #edf2f7; border: 1px solid rgba(0,102,204,0.15); color: var(--text-faint);
  }

  /* ── PREVIEW ── */
  .preview-wrap { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--border2); }
  .preview-wrap img { width: 100%; max-height: 260px; object-fit: contain; display: block; }
  .preview-lbl {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 10px 14px; background: linear-gradient(0deg, rgba(0,102,204,0.12), transparent);
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #0066cc;
  }

  /* ── API KEY INPUT ── */
  .api-label { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--text-faint); }
  .api-input {
    width: 100%; padding: 11px 14px;
    background: #f7fafc; border: 1px solid rgba(0,102,204,0.2);
    border-radius: 10px; color: var(--text);
    font-family: 'IBM Plex Mono', monospace; font-size: 13px; outline: none;
    transition: border-color 0.2s;
  }
  .api-input:focus { border-color: rgba(0,102,204,0.5); box-shadow: 0 0 0 3px rgba(0,102,204,0.08); }
  .api-input.has-key { border-color: rgba(0,135,90,0.4); }

  /* ── BUTTONS ── */
  .btn-primary {
    width: 100%; padding: 14px 20px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(0,85,164,0.35), 0 0 0 1px rgba(0,85,164,0.2);
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,85,164,0.45), 0 0 0 1px rgba(0,85,164,0.3); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-ghost {
    width: 100%; padding: 11px; border: 1px solid var(--border2); border-radius: 12px;
    background: transparent; color: var(--text-faint); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: rgba(220,38,38,0.4); color: #dc2626; background: rgba(220,38,38,0.05); }

  .btn-sm {
    display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px;
    border-radius: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; border: 1px solid rgba(0,102,204,0.15);
    background: #f0f4f8; color: var(--text-dim);
  }
  .btn-sm:hover { border-color: rgba(0,102,204,0.4); color: #0066cc; background: rgba(0,102,204,0.06); }
  .btn-sm.copied { border-color: rgba(0,135,90,0.4); color: #00875a; background: rgba(0,135,90,0.06); }

  .btn-action {
    display: flex; align-items: center; gap: 6px; padding: 8px 16px;
    border: 1px solid rgba(0,102,204,0.15); border-radius: 10px;
    background: #f0f4f8; color: var(--text-dim);
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-action:hover { border-color: rgba(0,102,204,0.35); color: #0066cc; background: rgba(0,102,204,0.07); }
  .btn-action:disabled { opacity: 0.35; cursor: not-allowed; }

  .btn-danger {
    display: flex; align-items: center; gap: 6px; padding: 8px 16px;
    border: 1px solid rgba(220,38,38,0.2); border-radius: 10px;
    background: rgba(220,38,38,0.06); color: #dc2626;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-danger:hover { background: rgba(220,38,38,0.12); border-color: rgba(220,38,38,0.4); }
  .btn-danger:disabled { opacity: 0.35; cursor: not-allowed; }

  .btn-rescan {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px 20px;
    border: 1px solid var(--border2); border-radius: 12px;
    background: var(--surface2); color: var(--text-dim);
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; margin-top: 4px;
  }
  .btn-rescan:hover { border-color: rgba(0,102,204,0.35); color: #3399ff; background: rgba(0,102,204,0.07); }

  /* ── HISTORY ── */
  .hist-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .hist-title { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-faint); }
  .btn-clr-hist {
    font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; padding: 3px 8px;
    border: 1px solid rgba(220,38,38,0.2); border-radius: 6px;
    background: transparent; color: rgba(220,38,38,0.5); cursor: pointer; transition: all 0.2s;
  }
  .btn-clr-hist:hover { background: rgba(220,38,38,0.08); color: #dc2626; }
  .hist-list { display: flex; flex-direction: column; gap: 6px; }
  .hist-item {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 11px 14px; border-radius: 12px;
    background: var(--surface2); border: 1px solid var(--border);
    cursor: pointer; transition: all 0.2s;
  }
  .hist-item:hover { border-color: rgba(0,102,204,0.3); background: var(--surface3); }
  .hist-patient { font-size: 13px; font-weight: 600; color: var(--text); }
  .hist-meta { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--text-faint); margin-top: 2px; }
  .hist-badge {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; padding: 2px 9px;
    border-radius: 99px; background: rgba(0,102,204,0.12);
    border: 1px solid rgba(0,102,204,0.25); color: #3399ff; white-space: nowrap;
  }

  /* ── MULTI PAGE ── */
  .pages-lbl { display: flex; align-items: center; gap: 8px; }
  .pages-lbl span:first-child { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--text-faint); }
  .page-badge {
    font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; padding: 2px 9px;
    border-radius: 99px; background: rgba(0,102,204,0.12);
    border: 1px solid rgba(0,102,204,0.25); color: #3399ff;
  }
  .thumbs-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .thumb-wrap { position: relative; width: 76px; height: 76px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border2); flex-shrink: 0; }
  .thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .thumb-del {
    position: absolute; top: 3px; right: 3px; width: 18px; height: 18px;
    border-radius: 50%; background: rgba(220,38,38,0.85); border: none; color: #fff;
    font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .btn-add-thumb {
    width: 76px; height: 76px; border-radius: 10px; flex-shrink: 0;
    border: 2px dashed rgba(0,140,255,0.3); background: rgba(0,102,204,0.04);
    color: rgba(0,102,204,0.4); font-size: 22px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .btn-add-thumb:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,120,220,0.1); }
  /* ── CAMERA CAPTURE BUTTON ── */
  .btn-camera {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 20px; border-radius: 16px; cursor: pointer;
    background: linear-gradient(135deg, rgba(0,102,204,0.1), rgba(0,102,204,0.06));
    border: 1px solid rgba(0,102,204,0.3);
    transition: all 0.25s;
    text-decoration: none;
  }
  .btn-camera:hover {
    background: linear-gradient(135deg, rgba(0,102,204,0.18), rgba(0,102,204,0.1));
    border-color: rgba(0,102,204,0.55);
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(0,102,204,0.2);
  }
  .btn-camera-icon { font-size: 28px; flex-shrink: 0; line-height: 1; }
  .btn-camera-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .btn-camera-sub { font-size: 11.5px; color: var(--text-faint); }

  /* ── UPLOAD OR DIVIDER ── */
  .upload-or {
    display: flex; align-items: center; gap: 10px;
    color: var(--text-faint); font-size: 11px; font-family: 'IBM Plex Mono', monospace;
    letter-spacing: 1.5px; text-transform: uppercase;
  }
  .upload-or::before, .upload-or::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }


  /* ════════════════════════════════════════════════════
     RESULTS PAGE — PREMIUM REDESIGN v3
  ════════════════════════════════════════════════════ */

  /* wrapper */
  .results-wrap {
    display: flex; flex-direction: column; gap: 0;
    animation: resultsIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes resultsIn { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }

  /* ── HERO BANNER ── */
  .res-hero {
    position: relative; overflow: hidden;
    border-radius: 20px; margin-bottom: 20px;
    background: linear-gradient(135deg, #0d0f1e 0%, #111428 50%, #0d1520 100%);
    border: 1px solid rgba(0,102,204,0.2);
    padding: 28px 32px;
  }
  .res-hero::before {
    content:''; position:absolute; top:-60px; right:-40px; width:300px; height:300px;
    border-radius:50%; pointer-events:none;
    background: radial-gradient(circle, rgba(0,102,204,0.12) 0%, transparent 70%);
  }
  .res-hero::after {
    content:''; position:absolute; bottom:-40px; left:20px; width:200px; height:200px;
    border-radius:50%; pointer-events:none;
    background: radial-gradient(circle, rgba(8,145,178,0.07) 0%, transparent 65%);
  }
  .res-hero-top {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px; margin-bottom: 20px; position: relative; z-index:1;
  }
  .res-hero-title-group { display:flex; align-items:center; gap:14px; }
  .res-hero-icon {
    width: 48px; height: 48px; border-radius: 14px; flex-shrink:0;
    background: linear-gradient(135deg, rgba(0,102,204,0.3), rgba(0,102,204,0.15));
    border: 1px solid rgba(0,102,204,0.3);
    display: flex; align-items: center; justify-content: center; font-size: 22px;
    box-shadow: 0 0 20px rgba(0,102,204,0.2);
  }
  .res-hero-title { font-family:'Playfair Display',serif; font-size:clamp(18px,3vw,24px); color:var(--text); font-weight:700; line-height:1.2; }
  .res-hero-sub { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-faint); letter-spacing:1.5px; margin-top:3px; }
  .res-hero-badges { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .res-pill-done {
    display:flex; align-items:center; gap:6px; padding:5px 14px; border-radius:99px;
    background:rgba(8,145,178,0.1); border:1px solid rgba(8,145,178,0.25);
    font-family:'JetBrains Mono',monospace; font-size:10px; color:#0891b2; white-space:nowrap;
  }
  .res-pill-dot { width:5px; height:5px; border-radius:50%; background:#0891b2; box-shadow:0 0 6px #0891b2; animation:dotPulse 2s ease-in-out infinite; }
  @keyframes dotPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  .res-pill-model {
    padding:5px 14px; border-radius:99px;
    background:rgba(0,102,204,0.1); border:1px solid rgba(0,102,204,0.2);
    font-family:'JetBrains Mono',monospace; font-size:10px; color:#3399ff;
  }

  /* stat tiles inside hero */
  .res-stats {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
    position: relative; z-index:1;
  }
  @media(max-width:640px){ .res-stats{grid-template-columns:repeat(2,1fr);} }
  .res-stat {
    padding: 14px 16px; border-radius: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    transition: all 0.2s; cursor: default;
  }
  .res-stat:hover { background: rgba(255,255,255,0.06); transform: translateY(-1px); }
  .res-stat-icon { font-size:18px; margin-bottom:6px; }
  .res-stat-num {
    font-family:'Playfair Display',serif;
    font-size: clamp(22px,3vw,28px); line-height:1; font-weight:700; margin-bottom:3px;
  }
  .res-stat:nth-child(1) .res-stat-num { color:#3399ff; }
  .res-stat:nth-child(2) .res-stat-num { color:#0891b2; }
  .res-stat:nth-child(3) .res-stat-num { color:var(--gold); }
  .res-stat:nth-child(4) .res-stat-num { color:#f472b6; }
  .res-stat-lbl { font-size:10.5px; color:var(--text-faint); font-weight:500; }

  /* action row below hero */
  .res-actions-bar {
    display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    margin-bottom: 20px;
  }

  /* ── MAIN TWO-COLUMN LAYOUT ── */
  .res-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    align-items: start;
  }
  @media(max-width:900px){ .res-body { grid-template-columns:1fr; } }

  /* ── LEFT: med list ── */
  .res-med-col { display:flex; flex-direction:column; gap:12px; }
  .res-col-hdr {
    display:flex; align-items:center; gap:10px;
    font-family:'JetBrains Mono',monospace; font-size:10px;
    text-transform:uppercase; letter-spacing:2px; color:var(--text-faint);
    padding-bottom:10px; border-bottom:1px solid var(--border);
  }
  .res-col-count {
    margin-left:auto; padding:2px 10px; border-radius:99px;
    background:rgba(0,102,204,0.12); border:1px solid rgba(0,102,204,0.2);
    color:#3399ff; font-size:9px;
  }

  /* ── MED CARD ── */
  .med-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 18px; overflow:hidden; position:relative;
    transition: all 0.25s ease;
  }
  .med-card:hover {
    border-color: rgba(0,102,204,0.35);
    box-shadow: 0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,102,204,0.1);
    transform: translateY(-2px);
  }
  /* numbered accent strip on left */
  .med-card-strip {
    position:absolute; left:0; top:0; bottom:0; width:3px;
    background: linear-gradient(180deg, var(--accent), #3399ff, #0891b2);
  }

  /* card header */
  .mc-hdr {
    padding: 16px 18px 14px 20px;
    display:flex; align-items:flex-start; justify-content:space-between; gap:10px;
  }
  .mc-hdr-left { flex:1; display:flex; flex-direction:column; gap:4px; }
  .mc-num {
    font-family:'JetBrains Mono',monospace; font-size:9px; text-transform:uppercase;
    letter-spacing:2.5px; color:var(--accent); font-weight:600;
  }
  .mc-name {
    font-family:'Playfair Display',serif; font-size:19px; color:var(--text);
    font-weight:700; line-height:1.25;
  }
  .mc-tags { display:flex; align-items:center; flex-wrap:wrap; gap:5px; margin-top:2px; }
  .mc-dose-badge {
    padding:3px 10px; border-radius:8px;
    background:rgba(0,135,90,0.12); border:1px solid rgba(0,135,90,0.3);
    font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--gold); font-weight:700;
  }
  .btn-search {
    display:inline-flex; align-items:center; gap:3px; padding:3px 9px;
    border:1px solid var(--border2); border-radius:7px;
    background:var(--surface3); color:#0891b2;
    font-family:'JetBrains Mono',monospace; font-size:9.5px;
    cursor:pointer; text-decoration:none; transition:all 0.2s; font-weight:500;
  }
  .btn-search:hover { border-color:rgba(8,145,178,0.4); background:rgba(8,145,178,0.07); }
  .mc-hdr-right { display:flex; align-items:flex-start; gap:6px; flex-shrink:0; }

  /* description band */
  .mc-desc-band {
    margin: 0 18px 0 20px; padding: 10px 12px;
    background:rgba(255,255,255,0.025); border-radius:10px;
    border:1px solid rgba(255,255,255,0.05);
    font-size:12.5px; color:var(--text-dim); line-height:1.6;
  }

  /* detail grid */
  .mc-detail-grid {
    display:grid; grid-template-columns:repeat(3,1fr); gap:1px;
    margin:12px 18px 0 20px;
    background:var(--border); border-radius:12px; overflow:hidden;
  }
  .mc-detail-cell {
    padding:10px 12px; background:var(--surface3);
    display:flex; flex-direction:column; gap:3px;
  }
  .mc-detail-cell.span2 { grid-column:span 2; }
  .mc-detail-cell.span3 { grid-column:span 3; }
  .mc-det-key {
    font-family:'JetBrains Mono',monospace; font-size:8.5px;
    text-transform:uppercase; letter-spacing:1.2px; color:var(--text-faint);
  }
  .mc-det-val { font-size:12.5px; color:var(--text); font-weight:600; line-height:1.3; }

  /* instructions strip */
  .mc-instructions-strip {
    margin:10px 18px 0 20px; padding:9px 12px; border-radius:10px;
    background:rgba(0,102,204,0.06); border:1px solid rgba(0,102,204,0.15);
  }
  .mc-instr-lbl {
    font-family:'JetBrains Mono',monospace; font-size:8.5px;
    text-transform:uppercase; letter-spacing:1px; color:#3399ff;
    margin-bottom:3px;
  }
  .mc-instr-txt { font-size:12.5px; color:var(--text-dim); line-height:1.5; }

  /* confidence bar */
  .mc-conf {
    display:flex; align-items:center; gap:10px;
    padding:12px 18px 16px 20px;
  }
  .mc-conf-lbl { font-family:'JetBrains Mono',monospace; font-size:8.5px; text-transform:uppercase; letter-spacing:1px; color:var(--text-faint); white-space:nowrap; }
  .mc-conf-track { flex:1; height:3px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; }
  .mc-conf-fill { height:100%; border-radius:99px; transition:width 0.9s cubic-bezier(0.16,1,0.3,1); }
  .mc-conf-pct { font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--text-faint); min-width:30px; text-align:right; }

  /* ── RIGHT SIDEBAR ── */
  .res-sidebar { display:flex; flex-direction:column; gap:14px; }

  /* generic sidebar card */
  .sb-card {
    background:var(--surface2); border:1px solid var(--border); border-radius:16px; overflow:hidden;
  }
  .sb-card-hdr {
    padding:11px 16px;
    display:flex; align-items:center; gap:8px;
    border-bottom:1px solid var(--border);
  }
  .sb-card-hdr-icon { font-size:13px; }
  .sb-card-hdr-title {
    font-family:'JetBrains Mono',monospace; font-size:9.5px;
    text-transform:uppercase; letter-spacing:2px;
  }
  .sb-card-body { padding:14px 16px; display:flex; flex-direction:column; gap:10px; }

  /* patient info */
  .sb-card.sb-patient .sb-card-hdr { background:rgba(8,145,178,0.04); }
  .sb-card.sb-patient .sb-card-hdr-title { color:#0891b2; }
  .sb-field { display:flex; flex-direction:column; gap:2px; }
  .sb-field-key { font-family:'JetBrains Mono',monospace; font-size:8.5px; text-transform:uppercase; letter-spacing:1px; color:var(--text-faint); }
  .sb-field-val { font-size:13.5px; color:var(--text); font-weight:600; }

  /* notes */
  .sb-card.sb-notes { border-left:3px solid var(--accent); }
  .sb-card.sb-notes .sb-card-hdr { background:rgba(0,102,204,0.04); }
  .sb-card.sb-notes .sb-card-hdr-title { color:#3399ff; }
  .sb-notes-txt { font-size:13px; color:var(--text-dim); line-height:1.65; }

  /* schedule */
  .sb-card.sb-sched .sb-card-hdr { background:rgba(0,135,90,0.04); }
  .sb-card.sb-sched .sb-card-hdr-title { color:var(--gold); }
  .sb-sched-slot { padding:8px 0; border-bottom:1px solid var(--border); }
  .sb-sched-slot:last-child { border-bottom:none; padding-bottom:0; }
  .sb-slot-time {
    font-family:'JetBrains Mono',monospace; font-size:9px;
    text-transform:uppercase; letter-spacing:1.2px; color:var(--text-faint); margin-bottom:5px;
  }
  .sb-slot-items { display:flex; flex-direction:column; gap:3px; }
  .sb-slot-med { display:flex; align-items:baseline; gap:7px; font-size:12px; color:var(--text-dim); }
  .sb-slot-dose { font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--gold); font-weight:600; }
  .sb-slot-empty { font-size:11px; color:var(--text-faint); font-style:italic; }

  /* tools card */
  .sb-card.sb-tools .sb-card-hdr { background:rgba(255,255,255,0.02); }
  .sb-card.sb-tools .sb-card-hdr-title { color:var(--text-faint); }

  /* interaction box */
  .int-box {
    background:rgba(220,38,38,0.05); border:1px solid rgba(220,38,38,0.2);
    border-left:3px solid #dc2626; border-radius:12px; padding:12px 14px;
  }
  .int-hdr { font-family:'JetBrains Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:1.8px; color:#dc2626; margin-bottom:8px; display:flex; align-items:center; gap:8px; }
  .int-hdr::after { content:''; flex:1; height:1px; background:rgba(220,38,38,0.15); }
  .int-item { padding:8px 10px; border-radius:8px; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.12); margin-bottom:6px; font-size:11.5px; color:rgba(255,180,180,0.85); line-height:1.5; }
  .int-item:last-child { margin-bottom:0; }
  .int-pair { font-family:'JetBrains Mono',monospace; font-size:10px; color:#dc2626; margin-bottom:3px; font-weight:600; }
  .int-safe { font-size:12px; color:#0891b2; display:flex; align-items:center; gap:6px; font-weight:500; }

  /* translate */
  .translate-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .lang-select {
    flex:1; padding:8px 12px; border:1px solid var(--border2); border-radius:10px;
    background:var(--surface3); color:var(--text);
    font-family:'JetBrains Mono',monospace; font-size:11.5px; outline:none; cursor:pointer;
  }
  .lang-select option { background:var(--surface); color:var(--text); }
  .translated-box {
    background:rgba(0,102,204,0.05); border:1px solid rgba(0,102,204,0.15);
    border-left:3px solid #3399ff; border-radius:12px; padding:12px 14px;
  }
  .trans-hdr { font-family:'JetBrains Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:1.8px; color:#3399ff; margin-bottom:8px; }
  .trans-txt { font-size:13px; color:var(--text-dim); line-height:1.7; white-space:pre-wrap; }

  /* err + btn legacy */
  .err-box { background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:12px; padding:14px 16px; display:flex; gap:9px; align-items:flex-start; font-size:13px; color:#dc2626; line-height:1.5; }
  .btn-sm { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:8px; font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:500; cursor:pointer; transition:all 0.2s; border:1px solid var(--border2); background:var(--surface3); color:var(--text-dim); }
  .btn-sm:hover { border-color:rgba(0,102,204,0.4); color:#3399ff; background:rgba(0,102,204,0.08); }
  .btn-sm.copied { border-color:rgba(8,145,178,0.4); color:#0891b2; background:rgba(8,145,178,0.06); }
  .stats-grid,.stat-tile,.stat-ico,.stat-val,.stat-lbl { display:none; }
  .sec-div { display:none; }
  .info-box,.info-hdr,.info-row,.info-key,.info-val { display:none; }
  .notes-box,.notes-lbl,.notes-txt { display:none; }
  .schedule-box,.sched-hdr,.sched-grid,.sched-slot { display:none; }
  /* old classes that may linger */
  .res-topbar,.res-topbar-left,.res-badge-done,.res-title-main,.res-actions { display:none; }
  .res-cols,.res-left,.res-right,.res-sec-lbl { display:none; }
  .mc-header,.mc-header-left,.mc-index,.mc-name-tags,.mc-header-right { display:none; }
  .mc-desc,.mc-pills,.mc-pill,.mc-pill-key,.mc-pill-val { display:none; }
  .mc-instructions,.mc-instructions-lbl { display:none; }
  .conf-row,.conf-lbl,.conf-track,.conf-fill,.conf-pct { display:none; }
  .rx-info-card,.rx-info-card-hdr,.rx-info-rows,.rx-info-row,.rx-info-key,.rx-info-val,.rx-info-card-icon,.rx-info-card-title { display:none; }
  .rx-notes-card,.rx-notes-lbl,.rx-notes-txt { display:none; }
  .sched-card,.sched-card-hdr,.sched-card-title,.sched-slots,.sched-slot-row,.slot-time,.slot-meds,.slot-med,.slot-dose,.slot-empty { display:none; }
  .tools-card,.tools-card-hdr,.tools-body { display:none; }
  .res-stat-icon { display:block; }


  /* ══════════════════════════════════════════════════
     SHARE / EXPORT MODAL
  ══════════════════════════════════════════════════ */
  .share-modal-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(2, 5, 16, 0.82);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: shareBackdropIn 0.2s ease both;
  }
  @keyframes shareBackdropIn { from{opacity:0;} to{opacity:1;} }

  .share-modal {
    background: #f4f8fb;
    border: 1px solid rgba(0,60,120,0.15);
    border-radius: 22px;
    padding: 28px 24px 24px;
    width: 100%; max-width: 400px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,102,204,0.15);
    animation: shareModalIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
    position: relative;
  }
  @keyframes shareModalIn {
    from { opacity:0; transform:scale(0.9) translateY(20px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  .share-modal-hdr {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 6px;
  }
  .share-modal-title {
    font-family: 'Merriweather', serif;
    font-size: 20px; color: var(--text); font-weight: 700;
  }
  .share-modal-close {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    border: 1px solid var(--border2); background: var(--surface2);
    color: var(--text-faint); font-size: 13px; cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .share-modal-close:hover {
    background: rgba(220,38,38,0.1); color: #dc2626;
    border-color: rgba(220,38,38,0.3);
  }
  .share-modal-sub {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px;
    text-transform: uppercase; letter-spacing: 2px;
    color: var(--text-faint); margin-bottom: 20px;
  }

  .share-options { display: flex; flex-direction: column; gap: 10px; }

  .share-option {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 14px;
    cursor: pointer; border: 1px solid var(--border2);
    background: var(--surface2); transition: all 0.2s;
    text-align: left; width: 100%;
  }
  .share-option:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }

  .share-option.opt-wa  { border-color: rgba(37,211,102,0.2); }
  .share-option.opt-wa:hover  {
    background: rgba(37,211,102,0.07);
    border-color: rgba(37,211,102,0.45);
    box-shadow: 0 6px 20px rgba(37,211,102,0.12);
  }
  .share-option.opt-print { border-color: rgba(0,102,204,0.2); }
  .share-option.opt-print:hover {
    background: rgba(0,102,204,0.07);
    border-color: rgba(0,102,204,0.45);
    box-shadow: 0 6px 20px rgba(0,102,204,0.12);
  }
  .share-option.opt-copy { border-color: rgba(8,145,178,0.2); }
  .share-option.opt-copy:hover {
    background: rgba(8,145,178,0.07);
    border-color: rgba(8,145,178,0.45);
    box-shadow: 0 6px 20px rgba(8,145,178,0.12);
  }
  .share-option.opt-txt { border-color: rgba(0,135,90,0.2); }
  .share-option.opt-txt:hover {
    background: rgba(0,135,90,0.07);
    border-color: rgba(0,135,90,0.45);
    box-shadow: 0 6px 20px rgba(0,135,90,0.12);
  }

  .share-opt-icon {
    font-size: 26px; flex-shrink: 0;
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--surface3); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
  }
  .share-opt-label {
    font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3;
  }
  .share-opt-sub {
    font-size: 11.5px; color: var(--text-faint); margin-top: 2px;
  }

  /* ══════════════════════════════════════════════════
     SCAN OVERLAY — VAIDYADRISHTI NEXUS SCAN
     DESIGN: Full-screen split — hex grid LEFT, terminal RIGHT
  ══════════════════════════════════════════════════ */
  .scan-overlay {
    position: fixed; inset: 0; z-index: 100; overflow: hidden;
    background: #03101e;
    animation: soIn 0.55s cubic-bezier(0.16,1,0.3,1) both;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  @keyframes soIn  { from{opacity:0;} to{opacity:1;} }
  .scan-overlay.exit { animation: soOut 0.4s ease forwards; }
  @keyframes soOut { to{opacity:0;} }

  /* ── GLOBAL SCAN BG ── */
  .scan-overlay::before {
    content:''; position:absolute; inset:0; z-index:0; pointer-events:none;
    background:
      radial-gradient(ellipse 80% 60% at 25% 50%, rgba(0,85,164,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 60% 80% at 75% 50%, rgba(0,105,92,0.08) 0%, transparent 55%);
  }
  /* vertical divider */
  .scan-overlay::after {
    content:''; position:absolute; top:10%; bottom:10%; left:50%; width:1px; z-index:2; pointer-events:none;
    background: linear-gradient(180deg, transparent, rgba(0,140,255,0.25) 20%, rgba(0,140,255,0.45) 50%, rgba(0,140,255,0.25) 80%, transparent);
  }

  /* ══════════════
     LEFT PANEL
  ══════════════ */
  .so-left {
    position: relative; z-index: 5;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 28px; padding: 40px 32px;
  }

  /* HEX GRID */
  .so-hex-grid {
    position: absolute; inset: 0; overflow: hidden; pointer-events: none;
    opacity: 0.35;
  }
  .so-hex-grid svg { width: 100%; height: 100%; }

  /* Scan image */
  .scan-frame {
    position: relative; z-index: 5;
    width: clamp(140px, 22vw, 200px);
    border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(0,140,255,0.45);
    box-shadow: 0 0 0 4px rgba(0,140,255,0.08), 0 0 40px rgba(0,140,255,0.25);
  }
  .scan-frame img {
    width: 100%; max-height: 145px; object-fit: contain; display: block;
    filter: brightness(0.28) saturate(0.25) hue-rotate(220deg);
  }
  .scan-frame::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background: linear-gradient(rgba(0,102,204,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,102,204,0.05) 1px, transparent 1px);
    background-size: 14px 14px;
  }
  .scan-corner { position:absolute; width:13px; height:13px; border-style:solid; border-color: rgba(0,180,255,0.85); }
  .sc-tl{top:5px;left:5px;border-width:2px 0 0 2px;}
  .sc-tr{top:5px;right:5px;border-width:2px 2px 0 0;}
  .sc-bl{bottom:5px;left:5px;border-width:0 0 2px 2px;}
  .sc-br{bottom:5px;right:5px;border-width:0 2px 2px 0;}
  .scan-beam {
    position:absolute; left:0; right:0; height:2px; z-index:3;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.3), rgba(0,180,255,1), rgba(200,240,255,1), rgba(0,180,255,1), rgba(0,180,255,0.3), transparent);
    box-shadow: 0 0 12px rgba(0,180,255,0.9), 0 0 28px rgba(0,180,255,0.5);
    animation: soBeam 1.8s ease-in-out infinite;
  }
  @keyframes soBeam {
    0%  { top:4%;  opacity:0; }
    8%  { opacity:1; }
    45% { top:93%; opacity:1; }
    51% { top:93%; opacity:0; }
    52% { top:4%;  opacity:0; }
    100%{ top:93%; opacity:1; }
  }

  /* CENTRAL RING DIAL */
  .so-dial {
    position: relative; z-index: 5;
    width: 120px; height: 120px; flex-shrink: 0;
  }
  /* outer ring: rotating dashes */
  .so-dial-outer {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px dashed rgba(0,102,204,0.25);
    animation: dialSpin 8s linear infinite;
  }
  /* mid ring: spinning arc */
  .so-dial-mid {
    position: absolute; inset: 12px; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #29b6f6;
    border-right-color: rgba(41,182,246,0.35);
    animation: dialSpin 2s linear infinite;
    filter: drop-shadow(0 0 6px #29b6f6);
  }
  /* inner ring: reverse */
  .so-dial-inner {
    position: absolute; inset: 24px; border-radius: 50%;
    border: 1.5px solid transparent;
    border-top-color: #26c6da;
    border-left-color: rgba(38,198,218,0.35);
    animation: dialSpin 1.4s linear infinite reverse;
    filter: drop-shadow(0 0 4px #26c6da);
  }
  @keyframes dialSpin { to { transform: rotate(360deg); } }
  /* tick marks around dial */
  .so-dial-tick {
    position: absolute; top: 50%; left: 50%;
    width: 3px; height: 8px;
    background: rgba(41,182,246,0.6);
    border-radius: 2px;
    transform-origin: 0 0;
  }
  /* core center */
  .so-dial-core {
    position: absolute; inset: 44px; border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, rgba(0,160,255,0.8), rgba(0,100,200,0.6), rgba(0,60,140,0.3));
    border: 1px solid rgba(0,160,255,0.5);
    box-shadow: 0 0 20px rgba(0,160,255,0.7), inset 0 0 12px rgba(0,160,255,0.2);
    animation: coreBeat 1.5s ease-in-out infinite;
  }
  @keyframes coreBeat {
    0%,100%{ transform:scale(1);   box-shadow:0 0 20px rgba(0,160,255,0.7); }
    50%    { transform:scale(1.2); box-shadow:0 0 32px rgba(0,160,255,1.0), 0 0 60px rgba(0,160,255,0.35); }
  }
  /* ripple from core */
  .so-dial-ripple {
    position: absolute; inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(0,102,204,0.3);
    animation: dialRipple 2s ease-out infinite;
  }
  .so-dial-ripple:nth-child(8) { animation-delay: 1s; }
  @keyframes dialRipple {
    0%   { inset: 44px; opacity: 0.8; border-color: rgba(0,102,204,0.5); }
    100% { inset: -10px; opacity: 0; border-color: rgba(0,102,204,0); }
  }

  /* Brand under dial */
  .so-brand { position:relative; z-index:5; text-align:center; }
  .so-brand-name {
    font-family:'Merriweather',serif; font-size: clamp(15px,2.5vw,20px);
    color:#e8f4fd; letter-spacing:0.3px; display:block;
  }
  .so-brand-sub {
    font-family:'IBM Plex Mono',monospace; font-size:9px;
    color:rgba(180,210,240,0.55); letter-spacing:3px; text-transform:uppercase;
    display:block; margin-top:4px;
  }

  /* ══════════════
     RIGHT PANEL
  ══════════════ */
  .so-right {
    position: relative; z-index: 5;
    display: flex; flex-direction: column; justify-content: center;
    gap: 20px; padding: 40px 32px;
  }

  /* TERMINAL LOG WINDOW */
  .so-terminal {
    background: rgba(1,8,20,0.75);
    border: 1px solid rgba(0,102,204,0.2);
    border-radius: 12px; overflow: hidden;
    flex: 1; max-height: 260px;
  }
  .so-terminal-bar {
    padding: 8px 14px;
    background: rgba(0,102,204,0.08);
    border-bottom: 1px solid rgba(0,140,255,0.18);
    display: flex; align-items: center; gap: 8px;
  }
  .so-term-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .so-term-dot:nth-child(1) { background: rgba(220,38,38,0.7); }
  .so-term-dot:nth-child(2) { background: rgba(0,135,90,0.7); }
  .so-term-dot:nth-child(3) { background: rgba(8,145,178,0.7); }
  .so-term-title {
    font-family:'JetBrains Mono',monospace; font-size:10px;
    color: var(--text-faint); letter-spacing: 1px; margin-left: 4px;
  }
  .so-terminal-body {
    padding: 12px 14px;
    font-family:'JetBrains Mono',monospace; font-size:10.5px;
    line-height: 1.8; overflow: hidden;
  }
  .so-log-line {
    display: flex; align-items: baseline; gap: 8px;
    opacity: 0; animation: logAppear 0.4s ease forwards;
  }
  .so-log-line:nth-child(1)  { animation-delay: 0.1s; }
  .so-log-line:nth-child(2)  { animation-delay: 0.7s; }
  .so-log-line:nth-child(3)  { animation-delay: 1.4s; }
  .so-log-line:nth-child(4)  { animation-delay: 2.1s; }
  .so-log-line:nth-child(5)  { animation-delay: 2.8s; }
  .so-log-line:nth-child(6)  { animation-delay: 3.5s; }
  .so-log-line:nth-child(7)  { animation-delay: 4.2s; }
  @keyframes logAppear {
    from { opacity:0; transform: translateX(-6px); }
    to   { opacity:1; transform: translateX(0); }
  }
  .so-log-ts { color: rgba(100,180,255,0.55); font-size: 9px; white-space:nowrap; }
  .so-log-ok  { color: #4dd0e1; }
  .so-log-run { color: #81d4fa; }
  .so-log-inf { color: rgba(100,200,255,0.75); }
  .so-log-txt { color: rgba(180,215,245,0.55); }
  /* blinking cursor */
  .so-cursor {
    display:inline-block; width:7px; height:12px;
    background: #29b6f6; border-radius:1px; margin-left:2px;
    vertical-align:middle;
    animation: cursorBlink 1s step-end infinite;
  }
  @keyframes cursorBlink { 0%,100%{opacity:1;} 50%{opacity:0;} }

  /* PROGRESS */
  .so-prog { }
  .so-prog-top { display:flex; justify-content:space-between; margin-bottom:8px; }
  .so-prog-lbl { font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--text-faint); text-transform:uppercase; letter-spacing:2px; }
  .so-prog-pct { font-family:'JetBrains Mono',monospace; font-size:10px; color:#3399ff; font-weight:700; }
  .so-prog-track {
    height: 3px; background: rgba(255,255,255,0.04); border-radius:99px;
    overflow: visible; position: relative;
  }
  .so-prog-fill {
    height: 100%; border-radius: 99px; transition: width 0.4s ease;
    background: linear-gradient(90deg, #0055a4, #0288d1, #29b6f6, #26c6da);
    box-shadow: 0 0 10px rgba(41,182,246,0.7);
    position: relative;
  }
  .so-prog-fill::after {
    content:''; position:absolute; right:-4px; top:50%;
    transform: translateY(-50%);
    width: 8px; height: 8px; border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 14px #29b6f6, 0 0 26px rgba(41,182,246,0.6);
  }

  /* STEP LIST */
  .so-steps { display:flex; flex-direction:column; gap:5px; }
  .so-step {
    display:flex; align-items:center; gap:10px; padding:8px 12px;
    border-radius:9px; background:rgba(255,255,255,0.015);
    border:1px solid rgba(255,255,255,0.04);
    font-size:11px; color:rgba(240,244,255,0.22); transition:all 0.45s;
    font-family:'JetBrains Mono',monospace; letter-spacing:0.3px;
  }
  .so-step.active {
    background:rgba(0,140,255,0.1); border-color:rgba(0,140,255,0.35);
    color:#29b6f6; box-shadow:0 0 14px rgba(0,140,255,0.12);
  }
  .so-step.done { background:rgba(38,198,218,0.07); border-color:rgba(38,198,218,0.25); color:#4dd0e1; }
  .so-step-ico { font-size:12px; flex-shrink:0; width:16px; text-align:center; }

  /* ── FLOATING PARTICLES (full overlay) ── */
  .scan-particles { position:absolute; inset:0; pointer-events:none; z-index:1; overflow:hidden; }
  .sp {
    position: absolute; border-radius:50%;
    animation: spFloat linear infinite;
  }
  .sp:nth-child(1)  { width:2px;height:2px;background:rgba(41,182,246,0.7);left:8%;top:85%;animation-duration:14s;animation-delay:0s; }
  .sp:nth-child(2)  { width:1px;height:1px;background:rgba(38,198,218,0.6);left:22%;top:75%;animation-duration:18s;animation-delay:-4s; }
  .sp:nth-child(3)  { width:2px;height:2px;background:rgba(0,135,90,0.5);left:38%;top:92%;animation-duration:11s;animation-delay:-7s; }
  .sp:nth-child(4)  { width:1px;height:1px;background:rgba(255,255,255,0.35);left:55%;top:88%;animation-duration:16s;animation-delay:-2s; }
  .sp:nth-child(5)  { width:2px;height:2px;background:rgba(41,182,246,0.7);left:70%;top:80%;animation-duration:13s;animation-delay:-9s; }
  .sp:nth-child(6)  { width:1px;height:1px;background:rgba(100,200,255,0.5);left:84%;top:93%;animation-duration:15s;animation-delay:-5s; }
  .sp:nth-child(7)  { width:3px;height:3px;background:rgba(8,145,178,0.4);left:92%;top:70%;animation-duration:20s;animation-delay:-3s; }
  .sp:nth-child(8)  { width:1px;height:1px;background:rgba(0,135,90,0.5);left:47%;top:97%;animation-duration:10s;animation-delay:-1s; }
  @keyframes spFloat {
    0%   { transform:translateY(0) translateX(0); opacity:0; }
    8%   { opacity:0.9; }
    92%  { opacity:0.5; }
    100% { transform:translateY(-100vh) translateX(15px); opacity:0; }
  }

  /* ── SCAN ANIM — hidden legacy ── */
  .scan-anim { display:none; }
  /* mol-* legacy compat */
  .mol-nucleus,.mol-orbit,.mol-electron,.mol-ring-out { display:none; }

  /* ── RESPONSIVE: stack vertically on mobile ── */
  @media (max-width: 640px) {
    .scan-overlay {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
    .scan-overlay::after { display: none; }
    .so-left { padding: 20px 20px 12px; gap: 16px; flex-direction: row; flex-wrap: wrap; justify-content: center; }
    .so-right { padding: 12px 20px 20px; gap: 14px; }
    .scan-frame { width: clamp(100px, 40vw, 150px); }
    .so-dial { width: 80px; height: 80px; }
    .so-dial-core { inset: 30px; }
    .so-terminal { max-height: 140px; }
    .so-brand-name { font-size: 14px; }
  }
  
  @keyframes hexFade { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
        @media (max-width: 768px) {
    .header { height: 56px; }
    .brand-sub { display: none; }
    .step-bar { margin-top: 20px; }
    .step-label { font-size: 11px; }
    .main-wrap { margin-top: 18px; }
    .stats-grid { gap: 7px; }
    .stat-val { font-size: 24px; }
    .mc-details { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .header-pill { display: none; }
    .mc-name { font-size: 15px; }
    .btn-search { font-size: 9px; padding: 2px 7px; }
    .card-hdr { padding: 12px 16px; }
    .card-body { padding: 14px; gap: 12px; }
    .scan-anim { width: 130px; height: 130px; }
    .so-r0 { inset: 0; }
    .so-r1 { inset: 8px; }
    .so-r2 { inset: 24px; }
    .so-r3 { inset: 40px; }
    .so-core { inset: 50px; }
    .so-dot1 { inset: 8px; }
    .so-dot2 { inset: 24px; }
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    .main-wrap { max-width: 720px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
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
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("vaidyadrishti_history") || "[]"); } catch(e) { return []; } });
  const [copiedId, setCopiedId] = useState(null);
  const [lang, setLang] = useState("te");
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [copyShareDone, setCopyShareDone] = useState(false);
  const [extraImages, setExtraImages] = useState([]);
  const [checking, setChecking] = useState(false);
  const [interactions, setInteractions] = useState(null);

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
          let text = data.choices[0].message.content.replaceAll("```json","").replaceAll("```","").trim();
          const parsed = validateParsed(JSON.parse(text));
          setScanProgress(100);
          setTimeout(() => setDoneScanSteps([0,1,2,3]), 400);
          setTimeout(() => {
            setOverlayExiting(true);
            setTimeout(() => { setResult(parsed); setPhase("results"); saveToHistory(parsed); setOverlayExiting(false); }, 600);
          }, 900);
        } else {
          throw new Error(data.error?.message || "Unknown error");
        }
      } catch(e) {
        setOverlayExiting(true);
        setTimeout(() => { setError(e.message); setPhase("results"); setOverlayExiting(false); }, 600);
      }
    }, 500);
  };

  const resetAll = () => { setPhase("upload"); setImage(null); setImageBase64(null); setResult(null); setError(null); setExtraImages([]); setTranslated(null); setInteractions(null); setUploadExiting(false); };

  const saveToHistory = (parsed) => {
    const entry = { id: Date.now(), patientName: parsed.patientName || "Unknown", doctorName: parsed.doctorName || "Unknown", medCount: (parsed.medications || []).length, scannedAt: new Date().toLocaleString("en-IN", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }), data: parsed };
    const updated = [entry, ...history].slice(0, 5);
    setHistory(updated);
    try { localStorage.setItem("vaidyadrishti_history", JSON.stringify(updated)); } catch(e) {}
  };

  const copyMed = (med, id) => {
    const text = ["Medicine: " + med.name, med.dosage ? "Dosage: " + med.dosage : "", med.frequency ? "Frequency: " + med.frequency : "", med.duration ? "Duration: " + med.duration : "", med.instructions ? "Instructions: " + med.instructions : ""].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  /* ── Build plain-text report string (shared by all export types) ── */
  const buildReportText = () => {
    if (!result) return "";
    const lines = [];
    lines.push("VaidyaDrishti AI — Prescription Report");
    lines.push("Generated: " + new Date().toLocaleString("en-IN"));
    lines.push("━".repeat(42));
    if (notNull(result.patientName)) lines.push("Patient : " + result.patientName);
    if (notNull(result.doctorName))  lines.push("Doctor  : " + result.doctorName);
    if (notNull(result.date))        lines.push("Date    : " + result.date);
    if (notNull(result.generalNotes)) { lines.push(""); lines.push("Notes: " + result.generalNotes); }
    lines.push(""); lines.push("MEDICATIONS"); lines.push("─".repeat(30));
    (result.medications || []).forEach((med, i) => {
      lines.push("");
      lines.push((i + 1) + ". " + med.name + (notNull(med.dosage) ? " — " + med.dosage : ""));
      if (notNull(med.description))   lines.push("   " + med.description);
      if (notNull(med.frequency))     lines.push("   📅 " + med.frequency);
      if (notNull(med.duration))      lines.push("   ⏱ " + med.duration);
      if (notNull(med.quantity))      lines.push("   📦 " + med.quantity);
      if (notNull(med.instructions))  lines.push("   ⚠ " + med.instructions);
    });
    lines.push(""); lines.push("─".repeat(30));
    lines.push("vaidyadrishti.ai — Powered by Groq");
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

  const doShareWhatsApp = () => {
    const text = buildReportText();
    const encoded = encodeURIComponent(text);
    window.open("https://wa.me/?text=" + encoded, "_blank");
    setShareModal(false);
  };

  const doCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(buildReportText());
      setCopyShareDone(true);
      setTimeout(() => setCopyShareDone(false), 2000);
    } catch(e) { alert("Copy failed — please copy manually."); }
  };

  /* ── XSS protection: escape all AI-returned strings before HTML injection ── */
  const escHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /* ── Validate AI JSON response shape before using it ── */
  const validateParsed = (obj) => {
    if (!obj || typeof obj !== "object") throw new Error("Invalid response structure from AI.");
    if (!Array.isArray(obj.medications)) obj.medications = [];
    obj.medications = obj.medications.map(m => ({
      name:         typeof m.name === "string"         ? m.name.slice(0, 120)         : "Unknown",
      description:  typeof m.description === "string"  ? m.description.slice(0, 500)  : null,
      dosage:       typeof m.dosage === "string"        ? m.dosage.slice(0, 60)        : null,
      frequency:    typeof m.frequency === "string"     ? m.frequency.slice(0, 100)    : null,
      duration:     typeof m.duration === "string"      ? m.duration.slice(0, 100)     : null,
      instructions: typeof m.instructions === "string"  ? m.instructions.slice(0, 300) : null,
      quantity:     typeof m.quantity === "string"      ? m.quantity.slice(0, 60)      : null,
      confidence:   typeof m.confidence === "number"    ? Math.min(100, Math.max(0, m.confidence)) : 75,
    }));
    obj.patientName   = typeof obj.patientName   === "string" ? obj.patientName.slice(0, 120)   : null;
    obj.doctorName    = typeof obj.doctorName    === "string" ? obj.doctorName.slice(0, 120)    : null;
    obj.date          = typeof obj.date          === "string" ? obj.date.slice(0, 60)           : null;
    obj.generalNotes  = typeof obj.generalNotes  === "string" ? obj.generalNotes.slice(0, 600)  : null;
    return obj;
  };

  const doPrint = () => {
    const w = window.open("", "_blank", "width=700,height=900");
    if (!w) { alert("Popup blocked — please allow popups for this site."); return; }
    const meds = (result.medications || []);
    const e = escHtml; // shorthand
    const medRows = meds.map((med, i) => `
      <div class="med-block">
        <div class="med-num">Rx ${String(i+1).padStart(2,"0")}</div>
        <div class="med-name">${e(med.name)}${notNull(med.dosage) ? ' <span class="dosage">'+e(med.dosage)+'</span>' : ''}</div>
        ${notNull(med.description) ? '<div class="med-desc">'+e(med.description)+'</div>' : ''}
        <div class="med-grid">
          ${notNull(med.frequency)    ? '<div><b>Frequency</b><br>'+e(med.frequency)+'</div>' : ''}
          ${notNull(med.duration)     ? '<div><b>Duration</b><br>'+e(med.duration)+'</div>' : ''}
          ${notNull(med.quantity)     ? '<div><b>Quantity</b><br>'+e(med.quantity)+'</div>' : ''}
          ${notNull(med.instructions) ? '<div style="grid-column:span 3"><b>Instructions</b><br>'+e(med.instructions)+'</div>' : ''}
        </div>
      </div>`).join('');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
    <title>VaidyaDrishti Report</title>
    <style>
      body { font-family: Georgia, serif; max-width: 680px; margin: 32px auto; color: #1a1a2e; }
      h1 { font-size: 22px; color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 8px; margin-bottom: 4px; }
      .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
      .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .info-table td { padding: 6px 10px; border: 1px solid #ddd; font-size: 13px; }
      .info-table td:first-child { font-weight: bold; background: #f4f4f8; width: 30%; }
      .notes { background: #f9f7ff; border-left: 4px solid #0066cc; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin-bottom: 24px; }
      .sec-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #0066cc; margin-bottom: 14px; border-bottom: 1px solid #e0dff8; padding-bottom: 6px; }
      .med-block { border: 1px solid #e0dff8; border-left: 4px solid #0066cc; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; }
      .med-num { font-size: 10px; font-family: monospace; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2px; }
      .med-name { font-size: 18px; font-weight: bold; color: #1a1a2e; margin-bottom: 6px; }
      .dosage { font-size: 12px; background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 6px; margin-left: 8px; font-family: monospace; }
      .med-desc { font-size: 12.5px; color: #555; margin-bottom: 8px; font-style: italic; }
      .med-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px; }
      .med-grid div { background: #f4f4f8; padding: 7px 9px; border-radius: 6px; }
      .med-grid b { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 2px; }
      .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; }
      @media print { body { margin: 16px; } }
    </style></head><body>
    <h1>📋 Prescription Report</h1>
    <div class="meta">Generated by VaidyaDrishti AI &middot; ${e(new Date().toLocaleString("en-IN"))}</div>
    ${notNull(result.patientName)||notNull(result.doctorName)||notNull(result.date) ? `
    <table class="info-table">
      ${notNull(result.patientName)?'<tr><td>Patient</td><td>'+e(result.patientName)+'</td></tr>':''}
      ${notNull(result.doctorName)?'<tr><td>Doctor</td><td>'+e(result.doctorName)+'</td></tr>':''}
      ${notNull(result.date)?'<tr><td>Date</td><td>'+e(result.date)+'</td></tr>':''}
    </table>` : ''}
    ${notNull(result.generalNotes) ? '<div class="notes">'+e(result.generalNotes)+'</div>' : ''}
    <div class="sec-title">Medications (${meds.length})</div>
    ${medRows}
    <div class="footer">VaidyaDrishti AI &middot; Powered by Groq &middot; For informational use only</div>
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
      const summary = "Patient: " + (result.patientName || "N/A") + "\nDoctor: " + (result.doctorName || "N/A") + "\nDate: " + (result.date || "N/A") + (notNull(result.generalNotes) ? "\nNotes: " + result.generalNotes + "\n" : "") + "\nMedications:\n" + (result.medications || []).map((m, i) => (i+1) + ". " + m.name + (notNull(m.dosage) ? " " + m.dosage : "") + (notNull(m.frequency) ? ", " + m.frequency : "") + (notNull(m.duration) ? ", for " + m.duration : "") + (notNull(m.instructions) ? " — " + m.instructions : "")).join("\n");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
        body: JSON.stringify({ model: "meta-llama/llama-4-scout-17b-16e-instruct", max_tokens: 1500, messages: [{ role: "user", content: "Translate the following prescription summary into " + langNames[lang] + ". Keep medicine names in English. Return only the translation:\n\n" + summary }] })
      });
      const data = await res.json();
      if (data.choices) setTranslated(data.choices[0].message.content);
    } catch(e) { setTranslated("Translation failed. Please try again."); }
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
        let text = data.choices[0].message.content.replaceAll("```json","").replaceAll("```","").trim();
        const ix = JSON.parse(text);
        if (!ix || typeof ix !== "object") throw new Error("Bad interactions response");
        if (!Array.isArray(ix.interactions)) ix.interactions = [];
        setInteractions(ix);
      }
    } catch(e) { setInteractions({ interactions: [], safe: true, error: true }); }
    setChecking(false);
  };

  const getConfColor = (score) => {
    if (score >= 85) return "#0891b2";
    if (score >= 60) return "#3399ff";
    return "var(--gold)";
  };

  const medCount = result?.medications?.length || 0;
  const step1Done = phase === "scanning" || phase === "results";
  const step2Active = phase === "results";

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <div className="logo">👁</div>
            <div>
              <div className="brand-name">VaidyaDrishti <span>AI</span></div>
              <div className="brand-sub">वैद्यदृष्टि · Prescription Vision</div>
            </div>
          </div>
          <div className="header-pill">
            <div className="live-dot" />
            Groq Vision
          </div>
        </header>

        {/* STEP BAR */}
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

        {/* MAIN */}
        <div className="main-wrap">

          {/* UPLOAD PHASE */}
          {phase === "upload" && (
            <div className={`card${uploadExiting ? " exit" : ""}`}>
              <div className="card-hdr">
                <span className="card-lbl">Prescription Image</span>
                <span className="card-tag">Step 01 — Upload</span>
              </div>
              <div className="card-body">
                {!image ? (
                  <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                    {/* Camera capture button — mobile-first */}
                    <label className="btn-camera">
                      <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
                      <span className="btn-camera-icon">📷</span>
                      <div>
                        <div className="btn-camera-title">Take Photo</div>
                        <div className="btn-camera-sub">Use camera to capture prescription</div>
                      </div>
                    </label>

                    {/* divider */}
                    <div className="upload-or"><span>or</span></div>

                    {/* drag & drop / browse */}
                    <div className={`drop-zone${dragging ? " dz-on" : ""}`}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
                      <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                      <div className="dz-icon-wrap">📂</div>
                      <div>
                        <div className="dz-title">Upload from Gallery</div>
                        <div className="dz-sub">Drag & drop or click to browse</div>
                      </div>
                      <div className="fmt-chips">{["JPG","PNG","WEBP"].map(f => <span key={f} className="fchip">{f}</span>)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-wrap">
                    <img src={image} alt="Prescription" />
                    <div className="preview-lbl">✓ Image loaded — ready to scan</div>
                  </div>
                )}

                {/* HISTORY */}
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

                {/* MULTI PAGE */}
                {image && (
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    <div className="pages-lbl">
                      <span>Pages</span>
                      <span className="page-badge">{1 + extraImages.length} page{(1 + extraImages.length) > 1 ? "s" : ""}</span>
                    </div>
                    <div className="thumbs-row">
                      <div className="thumb-wrap"><img src={image} alt="p1" /></div>
                      {extraImages.map((img, i) => (
                        <div className="thumb-wrap" key={i}>
                          <img src={img.url} alt={"p"+(i+2)} />
                          <button className="thumb-del" onClick={() => removeExtraPage(i)}>✕</button>
                        </div>
                      ))}
                      <label className="btn-add-thumb" title="Add page">
                        <input type="file" accept="image/*" style={{display:"none"}} onChange={e => { if(e.target.files[0]) addExtraPage(e.target.files[0]); e.target.value=""; }} />
                        +
                      </label>
                    </div>
                  </div>
                )}

                {/* API KEY — hidden from UI, reads from .env */}
                <input
                  type="password" value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{position:"absolute",opacity:0,pointerEvents:"none",width:0,height:0,overflow:"hidden"}}
                  tabIndex={-1} aria-hidden="true"
                />

                <button className="btn-primary" onClick={scanPrescription} disabled={!image}>
                  <span>🔬</span> Analyze Prescription
                </button>
                {image && <button className="btn-ghost" onClick={resetAll}>✕ Clear</button>}
              </div>
            </div>
          )}

          {/* RESULTS PHASE */}
          {phase === "results" && (
            <div className="results-wrap">
              {error ? (
                <div className="err-box"><span>⚠️</span><span>{error}</span></div>
              ) : result && (
                <>
                  {/* ══ HERO BANNER ══ */}
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
                        <div className="res-pill-done"><div className="res-pill-dot"/>Scan Complete</div>
                        <div className="res-pill-model">Llama 4 Scout</div>
                      </div>
                    </div>

                    {/* stat tiles */}
                    <div className="res-stats">
                      <div className="res-stat">
                        <div className="res-stat-icon">💊</div>
                        <div className="res-stat-num">{medCount}</div>
                        <div className="res-stat-lbl">Medications</div>
                      </div>
                      <div className="res-stat">
                        <div className="res-stat-icon">📏</div>
                        <div className="res-stat-num">{(result.medications||[]).filter(m=>notNull(m.dosage)).length}</div>
                        <div className="res-stat-lbl">With Dosage</div>
                      </div>
                      <div className="res-stat">
                        <div className="res-stat-icon">🗓️</div>
                        <div className="res-stat-num">{(result.medications||[]).filter(m=>notNull(m.frequency)).length}</div>
                        <div className="res-stat-lbl">Scheduled</div>
                      </div>
                      <div className="res-stat">
                        <div className="res-stat-icon">🎯</div>
                        <div className="res-stat-num">{Math.round((result.medications||[]).reduce((s,m)=>s+(m.confidence||0),0)/Math.max(medCount,1))}%</div>
                        <div className="res-stat-lbl">Avg Confidence</div>
                      </div>
                    </div>
                  </div>

                  {/* action bar */}
                  <div className="res-actions-bar">
                    <button className="btn-action" onClick={exportReport}>📄 Export Report</button>
                    <button className="btn-rescan" style={{width:"auto",marginTop:0}} onClick={resetAll}>↩ New Scan</button>
                  </div>

                  {/* ══ BODY ══ */}
                  <div className="res-body">

                    {/* LEFT — medications */}
                    <div className="res-med-col">
                      <div className="res-col-hdr">
                        💊 Medications
                        <span className="res-col-count">{medCount} found</span>
                      </div>

                      {(result.medications||[]).length > 0
                        ? (result.medications||[]).map((med, i) => (
                          <div className="med-card" key={i}>
                            <div className="med-card-strip" />

                            {/* header */}
                            <div className="mc-hdr">
                              <div className="mc-hdr-left">
                                <div className="mc-num">Rx — {String(i+1).padStart(2,"0")}</div>
                                <div className="mc-name">{med.name}</div>
                                <div className="mc-tags">
                                  {notNull(med.dosage) && <span className="mc-dose-badge">{med.dosage}</span>}
                                  <a className="btn-search" href={"https://www.1mg.com/search/all?name="+encodeURIComponent(med.name)} target="_blank" rel="noopener noreferrer">🛒 1mg</a>
                                  <a className="btn-search" href={"https://www.netmeds.com/catalogsearch/result?q="+encodeURIComponent(med.name)} target="_blank" rel="noopener noreferrer">🛒 Netmeds</a>
                                </div>
                              </div>
                              <div className="mc-hdr-right">
                                <button className={`btn-sm${copiedId===i?" copied":""}`} onClick={()=>copyMed(med,i)}>{copiedId===i?"✓ Copied":"📋 Copy"}</button>
                              </div>
                            </div>

                            {/* description */}
                            {notNull(med.description) && (
                              <div className="mc-desc-band">{med.description}</div>
                            )}

                            {/* detail grid */}
                            {(notNull(med.frequency)||notNull(med.duration)||notNull(med.quantity)) && (
                              <div className="mc-detail-grid">
                                {notNull(med.frequency) && (
                                  <div className={`mc-detail-cell${!notNull(med.duration)&&!notNull(med.quantity)?" span3":!notNull(med.duration)||!notNull(med.quantity)?" span2":""}`}>
                                    <div className="mc-det-key">Frequency</div>
                                    <div className="mc-det-val">{med.frequency}</div>
                                  </div>
                                )}
                                {notNull(med.duration) && (
                                  <div className="mc-detail-cell">
                                    <div className="mc-det-key">Duration</div>
                                    <div className="mc-det-val">{med.duration}</div>
                                  </div>
                                )}
                                {notNull(med.quantity) && (
                                  <div className="mc-detail-cell">
                                    <div className="mc-det-key">Quantity</div>
                                    <div className="mc-det-val">{med.quantity}</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* instructions */}
                            {notNull(med.instructions) && (
                              <div className="mc-instructions-strip">
                                <div className="mc-instr-lbl">⚠ Special Instructions</div>
                                <div className="mc-instr-txt">{med.instructions}</div>
                              </div>
                            )}

                            {/* confidence */}
                            {med.confidence != null && (
                              <div className="mc-conf">
                                <span className="mc-conf-lbl">AI Confidence</span>
                                <div className="mc-conf-track">
                                  <div className="mc-conf-fill" style={{width:med.confidence+"%",background:getConfColor(med.confidence)}}/>
                                </div>
                                <span className="mc-conf-pct">{med.confidence}%</span>
                              </div>
                            )}
                          </div>
                        ))
                        : <div className="err-box"><span>⚠️</span><span>No medications could be extracted.</span></div>
                      }
                    </div>

                    {/* RIGHT — sidebar */}
                    <div className="res-sidebar">

                      {/* Patient info */}
                      {(notNull(result.patientName)||notNull(result.doctorName)||notNull(result.date)) && (
                        <div className="sb-card sb-patient">
                          <div className="sb-card-hdr">
                            <span className="sb-card-hdr-icon">🏥</span>
                            <span className="sb-card-hdr-title">Prescription Info</span>
                          </div>
                          <div className="sb-card-body">
                            {notNull(result.patientName) && <div className="sb-field"><div className="sb-field-key">Patient</div><div className="sb-field-val">{result.patientName}</div></div>}
                            {notNull(result.doctorName)  && <div className="sb-field"><div className="sb-field-key">Doctor</div><div className="sb-field-val">{result.doctorName}</div></div>}
                            {notNull(result.date)        && <div className="sb-field"><div className="sb-field-key">Date</div><div className="sb-field-val">{result.date}</div></div>}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {notNull(result.generalNotes) && (
                        <div className="sb-card sb-notes">
                          <div className="sb-card-hdr">
                            <span className="sb-card-hdr-icon">📝</span>
                            <span className="sb-card-hdr-title">General Notes</span>
                          </div>
                          <div className="sb-card-body">
                            <div className="sb-notes-txt">{result.generalNotes}</div>
                          </div>
                        </div>
                      )}

                      {/* Daily schedule */}
                      {(result.medications||[]).length > 0 && (
                        <div className="sb-card sb-sched">
                          <div className="sb-card-hdr">
                            <span className="sb-card-hdr-icon">🕐</span>
                            <span className="sb-card-hdr-title">Daily Schedule</span>
                          </div>
                          <div className="sb-card-body" style={{gap:"0"}}>
                            {Object.entries(buildSchedule(result.medications)).map(([slot,meds])=>(
                              <div className="sb-sched-slot" key={slot}>
                                <div className="sb-slot-time">{slot==="Morning"?"🌅 Morning":slot==="Afternoon"?"☀️ Afternoon":"🌙 Night"}</div>
                                <div className="sb-slot-items">
                                  {meds.length===0
                                    ? <div className="sb-slot-empty">No medications</div>
                                    : meds.map((m,i)=><div className="sb-slot-med" key={i}><span className="sb-slot-dose">{m.dose||"•"}</span>{m.name}</div>)
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Smart tools */}
                      <div className="sb-card sb-tools">
                        <div className="sb-card-hdr">
                          <span className="sb-card-hdr-icon">🛠</span>
                          <span className="sb-card-hdr-title">Smart Tools</span>
                        </div>
                        <div className="sb-card-body">

                          {/* Drug interactions */}
                          {(result.medications||[]).length >= 2 && (
                            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                              <button className="btn-danger" onClick={checkInteractions} disabled={checking} style={{width:"100%",justifyContent:"center"}}>
                                {checking?"⏳ Checking...":"⚠️ Check Drug Interactions"}
                              </button>
                              {interactions && (
                                <div className="int-box">
                                  <div className="int-hdr">Interactions</div>
                                  {interactions.safe && interactions.interactions.length===0
                                    ? <div className="int-safe">✅ No interactions found.</div>
                                    : (interactions.interactions||[]).map((ix,i)=>(
                                        <div className="int-item" key={i}>
                                          <div className="int-pair">{ix.drug1} ↔ {ix.drug2} · {ix.severity||"moderate"}</div>
                                          {ix.description}
                                        </div>
                                      ))
                                  }
                                </div>
                              )}
                            </div>
                          )}

                          {/* Translate */}
                          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                            <div className="translate-row">
                              <select className="lang-select" value={lang} onChange={e=>{setLang(e.target.value);setTranslated(null);}}>
                                <option value="te">Telugu</option>
                                <option value="hi">Hindi</option>
                                <option value="ta">Tamil</option>
                                <option value="bn">Bengali</option>
                                <option value="mr">Marathi</option>
                              </select>
                              <button className="btn-action" onClick={translateResult} disabled={translating}>
                                {translating?"⏳...":"🌐 Translate"}
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

                    </div>{/* end sidebar */}
                  </div>{/* end res-body */}

                  {/* bottom rescan */}
                  <div style={{paddingTop:"8px"}}>
                    <button className="btn-rescan" onClick={resetAll}>↩ Scan Another Prescription</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* SHARE MODAL */}
        {shareModal && (
          <div className="share-modal-backdrop" onClick={()=>setShareModal(false)}>
            <div className="share-modal" onClick={e=>e.stopPropagation()}>
              <div className="share-modal-hdr">
                <div className="share-modal-title">Share Report</div>
                <button className="share-modal-close" onClick={()=>setShareModal(false)}>✕</button>
              </div>
              <div className="share-modal-sub">Choose how to export</div>
              <div className="share-options">

                <button className="share-option opt-wa" onClick={doShareWhatsApp}>
                  <span className="share-opt-icon">💬</span>
                  <div>
                    <div className="share-opt-label">Share on WhatsApp</div>
                    <div className="share-opt-sub">Send full report as a message</div>
                  </div>
                </button>

                <button className="share-option opt-print" onClick={doPrint}>
                  <span className="share-opt-icon">🖨️</span>
                  <div>
                    <div className="share-opt-label">Print / Save as PDF</div>
                    <div className="share-opt-sub">Print or export formatted PDF</div>
                  </div>
                </button>


              </div>
            </div>
          </div>
        )}

        {/* SCAN OVERLAY — NEXUS SPLIT PANEL */}
        {phase === "scanning" && (
          <div className={`scan-overlay${overlayExiting ? " exit" : ""}`}>

            {/* particles */}
            <div className="scan-particles">
              {[...Array(8)].map((_,i) => <div key={i} className="sp" />)}
            </div>

            {/* ── LEFT PANEL ── */}
            <div className="so-left">

              {/* hex grid bg */}
              <div className="so-hex-grid">
                <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hexPat" x="0" y="0" width="52" height="60" patternUnits="userSpaceOnUse">
                      <polygon points="26,2 50,15 50,45 26,58 2,45 2,15" fill="none" stroke="rgba(0,102,204,0.2)" strokeWidth="0.8"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="600" fill="url(#hexPat)"/>
                  {/* animated highlight hexes */}
                  {[[52,30],[156,30],[260,30],[104,90],[208,90],[52,150],[312,90],[156,150],[260,150],[104,210],[208,210],[52,270],[312,210],[26,330],[130,330],[234,330],[338,330]].map(([x,y],i)=>(
                    <polygon key={i} points={`${x+24},${y} ${x+48},${y+13} ${x+48},${y+43} ${x+24},${y+56} ${x},${y+43} ${x},${y+13}`}
                      fill={`rgba(0,102,204,${0.03 + (i%4)*0.02})`} stroke="none"
                      style={{animation:`hexFade ${2+(i%3)*0.7}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}
                    />
                  ))}
                </svg>
              </div>

              {/* scan image */}
              {image && (
                <div className="scan-frame">
                  <img src={image} alt="Scanning" />
                  <div className="scan-beam" />
                  <div className="scan-corner sc-tl" /><div className="scan-corner sc-tr" />
                  <div className="scan-corner sc-bl" /><div className="scan-corner sc-br" />
                </div>
              )}

              {/* dial */}
              <div className="so-dial">
                <div className="so-dial-ripple" />
                <div className="so-dial-ripple" style={{animationDelay:"1s"}} />
                <div className="so-dial-outer" />
                <div className="so-dial-mid" />
                <div className="so-dial-inner" />
                {[...Array(12)].map((_,i) => (
                  <div key={i} className="so-dial-tick" style={{
                    transform:`translate(-50%, -50%) rotate(${i*30}deg) translateY(-52px)`,
                    opacity: i%3===0 ? 0.8 : 0.3,
                    height: i%3===0 ? "10px" : "6px"
                  }} />
                ))}
                <div className="so-dial-core" />
              </div>

              {/* brand */}
              <div className="so-brand">
                <span className="so-brand-name">VaidyaDrishti AI</span>
                <span className="so-brand-sub">विश्लेषण · Analyzing</span>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="so-right">

              {/* terminal log */}
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

              {/* progress */}
              <div className="so-prog">
                <div className="so-prog-top">
                  <span className="so-prog-lbl">Analysis</span>
                  <span className="so-prog-pct">{scanProgress}%</span>
                </div>
                <div className="so-prog-track">
                  <div className="so-prog-fill" style={{width: scanProgress + "%"}} />
                </div>
              </div>

              {/* steps */}
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
      {/* ── FOOTER ── */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-logo">👁</div>
            <div>
              <div className="footer-brand">VaidyaDrishti <span>AI</span></div>
              <div className="footer-copy">वैद्यदृष्टि · Prescription Vision</div>
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-tag">
              <div className="footer-tag-dot" style={{background:"#0891b2"}}/>
              Groq Vision
            </div>
            <div className="footer-divider"/>
            <div className="footer-tag">
              <div className="footer-tag-dot" style={{background:"#3399ff"}}/>
              Llama 4 Scout
            </div>
            <div className="footer-divider"/>
            <div className="footer-tag">
              <div className="footer-tag-dot" style={{background:"var(--gold)"}}/>
              React + Vite
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
