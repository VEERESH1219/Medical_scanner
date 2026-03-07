import { useState, useCallback, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #080b14;
    --surface:    #0e1220;
    --surface2:   #131829;
    --surface3:   #1a2035;
    --border:     rgba(255,255,255,0.07);
    --border2:    rgba(255,255,255,0.12);
    --accent:     #6c63ff;
    --accent2:    #a78bfa;
    --gold:       #f5a623;
    --gold2:      #ffd27a;
    --teal:       #2dd4bf;
    --red:        #f87171;
    --text:       #f0f4ff;
    --text-dim:   rgba(240,244,255,0.6);
    --text-faint: rgba(240,244,255,0.35);
    --glow-a:     rgba(108,99,255,0.25);
    --glow-g:     rgba(245,166,35,0.2);
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); font-family: 'Inter', sans-serif; min-height: 100vh; overflow-x: hidden; color: var(--text); }

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
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(108,99,255,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(245,166,35,0.08) 0%, transparent 55%),
      radial-gradient(ellipse 40% 60% at 50% 50%, rgba(45,212,191,0.04) 0%, transparent 70%);
  }

  /* ── HEADER ── */
  .header {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(16px, 4vw, 48px);
    height: 64px;
    background: rgba(8,11,20,0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .logo {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--accent), #4f46e5);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 20px rgba(108,99,255,0.4);
  }
  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(16px, 2.5vw, 20px);
    font-weight: 700; color: var(--text); letter-spacing: -0.3px;
  }
  .brand-name span { color: var(--gold); font-style: italic; }
  .brand-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: var(--text-faint); margin-top: 1px; letter-spacing: 0.5px;
  }
  .header-pill {
    display: flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 99px;
    background: rgba(108,99,255,0.1);
    border: 1px solid rgba(108,99,255,0.25);
    font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent2);
  }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--teal); box-shadow: 0 0 8px var(--teal);
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
    font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
    border: 1px solid var(--border2); background: var(--surface2); color: var(--text-faint);
    transition: all 0.4s;
  }
  .step-num.active {
    background: var(--accent); border-color: var(--accent); color: #fff;
    box-shadow: 0 0 16px rgba(108,99,255,0.5);
  }
  .step-num.done { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.4); color: var(--accent2); }
  .step-num.scanning-pulse { animation: stepGlow 1s ease-in-out infinite; }
  @keyframes stepGlow { 0%,100%{box-shadow:0 0 16px rgba(108,99,255,0.5);} 50%{box-shadow:0 0 28px rgba(108,99,255,0.8);} }
  .step-label { font-size: 12px; font-weight: 500; color: var(--text-dim); }
  .step-line { flex: 1; height: 1px; background: var(--border); margin: 0 10px; position: relative; overflow: hidden; max-width: 60px; }
  .step-line.active::after { content:''; position:absolute; inset:0; background: linear-gradient(90deg, var(--accent), var(--gold)); animation: lineFill 0.6s ease forwards; }
  @keyframes lineFill { from{width:0%} to{width:100%} }

  /* ── MAIN WRAP ── */
  .main-wrap {
    position: relative; z-index: 5;
    max-width: 860px; margin: 24px auto 0;
    padding: 0 clamp(12px, 4vw, 28px);
    padding-bottom: 80px;
  }

  /* ── CARDS ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden; position: relative;
    box-shadow: 0 4px 32px rgba(0,0,0,0.4);
    transition: all 0.4s;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--gold), var(--teal));
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
  .card-lbl { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-faint); flex: 1; }
  .card-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 9.5px; padding: 3px 10px;
    border-radius: 99px; background: rgba(108,99,255,0.12);
    border: 1px solid rgba(108,99,255,0.25); color: var(--accent2);
  }
  .card-body { padding: clamp(16px,3vw,24px); display: flex; flex-direction: column; gap: 14px; }

  /* ── DROP ZONE ── */
  .drop-zone {
    position: relative; border: 2px dashed rgba(108,99,255,0.25); border-radius: 16px;
    padding: clamp(36px,6vw,56px) 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    cursor: pointer; transition: all 0.3s; background: rgba(108,99,255,0.04);
  }
  .drop-zone:hover, .drop-zone.dz-on {
    border-color: var(--accent); background: rgba(108,99,255,0.08);
    box-shadow: 0 0 0 4px rgba(108,99,255,0.08), inset 0 0 40px rgba(108,99,255,0.04);
  }
  .drop-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; }
  .dz-icon-wrap {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.25);
    display: flex; align-items: center; justify-content: center; font-size: 28px;
    box-shadow: 0 0 24px rgba(108,99,255,0.2);
  }
  .dz-title { font-size: 15px; font-weight: 600; color: var(--text); text-align: center; }
  .dz-sub { font-size: 12px; color: var(--text-faint); text-align: center; }
  .fmt-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .fchip {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 9px;
    border-radius: 6px; background: var(--surface3); border: 1px solid var(--border2); color: var(--text-faint);
  }

  /* ── PREVIEW ── */
  .preview-wrap { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--border2); }
  .preview-wrap img { width: 100%; max-height: 260px; object-fit: contain; display: block; }
  .preview-lbl {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 10px 14px; background: linear-gradient(0deg, rgba(8,11,20,0.9), transparent);
    font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--teal);
  }

  /* ── API KEY INPUT ── */
  .api-label { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--text-faint); }
  .api-input {
    width: 100%; padding: 11px 14px;
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 10px; color: var(--text);
    font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none;
    transition: border-color 0.2s;
  }
  .api-input:focus { border-color: rgba(108,99,255,0.5); box-shadow: 0 0 0 3px rgba(108,99,255,0.08); }
  .api-input.has-key { border-color: rgba(45,212,191,0.35); }

  /* ── BUTTONS ── */
  .btn-primary {
    width: 100%; padding: 14px 20px; border: none; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent), #4f46e5);
    color: #fff; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(108,99,255,0.4), 0 0 0 1px rgba(108,99,255,0.2);
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(108,99,255,0.5), 0 0 0 1px rgba(108,99,255,0.3); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-ghost {
    width: 100%; padding: 11px; border: 1px solid var(--border2); border-radius: 12px;
    background: transparent; color: var(--text-faint); font-family: 'Inter', sans-serif; font-size: 13px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: rgba(248,113,113,0.4); color: var(--red); background: rgba(248,113,113,0.05); }

  .btn-sm {
    display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px;
    border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; border: 1px solid var(--border2);
    background: var(--surface2); color: var(--text-dim);
  }
  .btn-sm:hover { border-color: rgba(108,99,255,0.4); color: var(--accent2); background: rgba(108,99,255,0.08); }
  .btn-sm.copied { border-color: rgba(45,212,191,0.4); color: var(--teal); background: rgba(45,212,191,0.06); }

  .btn-action {
    display: flex; align-items: center; gap: 6px; padding: 8px 16px;
    border: 1px solid var(--border2); border-radius: 10px;
    background: var(--surface2); color: var(--text-dim);
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-action:hover { border-color: rgba(108,99,255,0.35); color: var(--accent2); background: rgba(108,99,255,0.07); }
  .btn-action:disabled { opacity: 0.35; cursor: not-allowed; }

  .btn-danger {
    display: flex; align-items: center; gap: 6px; padding: 8px 16px;
    border: 1px solid rgba(248,113,113,0.2); border-radius: 10px;
    background: rgba(248,113,113,0.06); color: var(--red);
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-danger:hover { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.4); }
  .btn-danger:disabled { opacity: 0.35; cursor: not-allowed; }

  .btn-rescan {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px 20px;
    border: 1px solid var(--border2); border-radius: 12px;
    background: var(--surface2); color: var(--text-dim);
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; margin-top: 4px;
  }
  .btn-rescan:hover { border-color: rgba(108,99,255,0.35); color: var(--accent2); background: rgba(108,99,255,0.07); }

  /* ── HISTORY ── */
  .hist-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .hist-title { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-faint); }
  .btn-clr-hist {
    font-family: 'JetBrains Mono', monospace; font-size: 9.5px; padding: 3px 8px;
    border: 1px solid rgba(248,113,113,0.2); border-radius: 6px;
    background: transparent; color: rgba(248,113,113,0.5); cursor: pointer; transition: all 0.2s;
  }
  .btn-clr-hist:hover { background: rgba(248,113,113,0.08); color: var(--red); }
  .hist-list { display: flex; flex-direction: column; gap: 6px; }
  .hist-item {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 11px 14px; border-radius: 12px;
    background: var(--surface2); border: 1px solid var(--border);
    cursor: pointer; transition: all 0.2s;
  }
  .hist-item:hover { border-color: rgba(108,99,255,0.3); background: var(--surface3); }
  .hist-patient { font-size: 13px; font-weight: 600; color: var(--text); }
  .hist-meta { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-faint); margin-top: 2px; }
  .hist-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 2px 9px;
    border-radius: 99px; background: rgba(108,99,255,0.12);
    border: 1px solid rgba(108,99,255,0.25); color: var(--accent2); white-space: nowrap;
  }

  /* ── MULTI PAGE ── */
  .pages-lbl { display: flex; align-items: center; gap: 8px; }
  .pages-lbl span:first-child { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--text-faint); }
  .page-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 9.5px; padding: 2px 9px;
    border-radius: 99px; background: rgba(108,99,255,0.12);
    border: 1px solid rgba(108,99,255,0.25); color: var(--accent2);
  }
  .thumbs-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .thumb-wrap { position: relative; width: 76px; height: 76px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border2); flex-shrink: 0; }
  .thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .thumb-del {
    position: absolute; top: 3px; right: 3px; width: 18px; height: 18px;
    border-radius: 50%; background: rgba(248,113,113,0.85); border: none; color: #fff;
    font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .btn-add-thumb {
    width: 76px; height: 76px; border-radius: 10px; flex-shrink: 0;
    border: 2px dashed rgba(108,99,255,0.25); background: rgba(108,99,255,0.04);
    color: rgba(108,99,255,0.4); font-size: 22px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .btn-add-thumb:hover { border-color: var(--accent); color: var(--accent); background: rgba(108,99,255,0.08); }

  /* ── STATS GRID ── */
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  @media(max-width:480px){ .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; } }
  .stat-tile {
    padding: 14px 16px; border-radius: 14px;
    background: var(--surface2); border: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 5px;
  }
  .stat-ico { font-size: 16px; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--accent2); line-height: 1; }
  .stat-lbl { font-size: 11px; color: var(--text-faint); }

  /* ── SECTION DIVIDER ── */
  .sec-div {
    display: flex; align-items: center; gap: 10px;
    font-family: 'JetBrains Mono', monospace; font-size: 9.5px;
    text-transform: uppercase; letter-spacing: 2px; color: var(--text-faint);
  }
  .sec-div::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* ── INFO BOX ── */
  .info-box {
    background: var(--surface2); border: 1px solid var(--border);
    border-left: 2px solid var(--teal); border-radius: 14px; padding: 14px 16px;
  }
  .info-hdr { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--teal); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .info-hdr::after { content: ''; flex: 1; height: 1px; background: rgba(45,212,191,0.15); }
  .info-row { display: flex; align-items: baseline; gap: 10px; font-size: 13px; margin-bottom: 6px; }
  .info-row:last-child { margin-bottom: 0; }
  .info-key { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: var(--text-faint); min-width: 60px; text-transform: uppercase; letter-spacing: 0.8px; }
  .info-val { color: var(--text); font-weight: 500; }

  /* ── NOTES BOX ── */
  .notes-box { background: var(--surface2); border: 1px solid var(--border); border-left: 2px solid var(--accent); border-radius: 14px; padding: 14px 16px; }
  .notes-lbl { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--accent2); margin-bottom: 7px; }
  .notes-txt { font-size: 13px; color: var(--text-dim); line-height: 1.65; }

  /* ── MED CARD ── */
  .med-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden; position: relative;
    transition: border-color 0.2s, transform 0.2s;
  }
  .med-card:hover { border-color: rgba(108,99,255,0.3); transform: translateY(-1px); }
  .med-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, var(--accent), var(--gold), var(--teal)); }
  .mc-top { padding: 14px 16px 0 18px; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .mc-name-row { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; flex: 1; }
  .mc-name { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--text); font-weight: 600; }
  .mc-badge {
    padding: 3px 10px; border-radius: 8px;
    background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.25);
    font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--gold);
    white-space: nowrap; font-weight: 600; flex-shrink: 0;
  }
  .mc-desc { padding: 6px 16px 0 18px; font-size: 12px; color: var(--text-faint); font-style: italic; line-height: 1.5; }
  .mc-div { margin: 10px 16px 0 18px; height: 1px; background: var(--border); }
  .mc-details { padding: 10px 16px 14px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .mc-det { display: flex; flex-direction: column; gap: 2px; }
  .mc-det.fw { grid-column: 1 / -1; }
  .dlbl { font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text-faint); }
  .dval { font-size: 12.5px; color: var(--text); font-weight: 500; line-height: 1.4; }

  /* ── CONFIDENCE BAR ── */
  .conf-row { display: flex; align-items: center; gap: 8px; padding: 4px 16px 0 18px; }
  .conf-lbl { font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); white-space: nowrap; }
  .conf-track { flex: 1; height: 3px; background: var(--surface3); border-radius: 99px; overflow: hidden; }
  .conf-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
  .conf-pct { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-faint); }

  /* ── SEARCH BTNS ── */
  .btn-search {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px;
    border: 1px solid var(--border2); border-radius: 7px;
    background: var(--surface2); color: var(--teal);
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    cursor: pointer; text-decoration: none; transition: all 0.2s; margin-left: 4px; font-weight: 500;
  }
  .btn-search:hover { border-color: rgba(45,212,191,0.35); background: rgba(45,212,191,0.06); }

  /* ── SCHEDULE ── */
  .schedule-box { background: var(--surface2); border: 1px solid var(--border); border-left: 2px solid var(--gold); border-radius: 14px; padding: 14px 16px; }
  .sched-hdr { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--gold); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .sched-hdr::after { content: ''; flex: 1; height: 1px; background: rgba(245,166,35,0.15); }
  .sched-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  @media(max-width:500px){ .sched-grid { grid-template-columns: 1fr; } }
  .sched-slot { background: var(--surface3); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; }
  .slot-time { font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--text-faint); margin-bottom: 6px; }
  .slot-meds { display: flex; flex-direction: column; gap: 4px; }
  .slot-med { font-size: 12px; color: var(--text-dim); display: flex; align-items: baseline; gap: 6px; }
  .slot-dose { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: var(--gold); flex-shrink: 0; font-weight: 600; }

  /* ── TRANSLATE ── */
  .translate-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .lang-select {
    padding: 8px 12px; border: 1px solid var(--border2); border-radius: 10px;
    background: var(--surface2); color: var(--text);
    font-family: 'JetBrains Mono', monospace; font-size: 12px; outline: none; cursor: pointer;
  }
  .lang-select option { background: var(--surface); color: var(--text); }
  .translated-box { background: var(--surface2); border: 1px solid var(--border); border-left: 2px solid var(--accent2); border-radius: 14px; padding: 14px 16px; }
  .trans-hdr { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--accent2); margin-bottom: 8px; }
  .trans-txt { font-size: 13px; color: var(--text-dim); line-height: 1.7; white-space: pre-wrap; }

  /* ── INTERACTIONS ── */
  .int-box { background: rgba(248,113,113,0.05); border: 1px solid rgba(248,113,113,0.2); border-left: 2px solid var(--red); border-radius: 14px; padding: 14px 16px; }
  .int-hdr { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.8px; color: var(--red); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .int-hdr::after { content: ''; flex: 1; height: 1px; background: rgba(248,113,113,0.15); }
  .int-item { padding: 8px 10px; border-radius: 8px; background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.12); margin-bottom: 6px; font-size: 12px; color: rgba(255,180,180,0.85); line-height: 1.5; }
  .int-item:last-child { margin-bottom: 0; }
  .int-pair { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--red); margin-bottom: 3px; font-weight: 600; }
  .int-safe { font-size: 12px; color: var(--teal); display: flex; align-items: center; gap: 6px; font-weight: 500; }

  /* ── ERR BOX ── */
  .err-box { background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.2); border-radius: 12px; padding: 14px 16px; display: flex; gap: 9px; align-items: flex-start; font-size: 13px; color: var(--red); line-height: 1.5; }

  /* ══════════════════════════════════════════════════
     SCAN OVERLAY — VAIDYADRISHTI NEXUS SCAN
     DESIGN: Full-screen split — hex grid LEFT, terminal RIGHT
  ══════════════════════════════════════════════════ */
  .scan-overlay {
    position: fixed; inset: 0; z-index: 100; overflow: hidden;
    background: #010309;
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
      radial-gradient(ellipse 80% 60% at 25% 50%, rgba(108,99,255,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 60% 80% at 75% 50%, rgba(45,212,191,0.04) 0%, transparent 55%);
  }
  /* vertical divider */
  .scan-overlay::after {
    content:''; position:absolute; top:10%; bottom:10%; left:50%; width:1px; z-index:2; pointer-events:none;
    background: linear-gradient(180deg, transparent, rgba(108,99,255,0.3) 20%, rgba(108,99,255,0.5) 50%, rgba(108,99,255,0.3) 80%, transparent);
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
    border: 1px solid rgba(108,99,255,0.35);
    box-shadow: 0 0 0 4px rgba(108,99,255,0.06), 0 0 40px rgba(108,99,255,0.2);
  }
  .scan-frame img {
    width: 100%; max-height: 145px; object-fit: contain; display: block;
    filter: brightness(0.28) saturate(0.25) hue-rotate(220deg);
  }
  .scan-frame::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background: linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px);
    background-size: 14px 14px;
  }
  .scan-corner { position:absolute; width:13px; height:13px; border-style:solid; border-color: rgba(167,139,250,0.8); }
  .sc-tl{top:5px;left:5px;border-width:2px 0 0 2px;}
  .sc-tr{top:5px;right:5px;border-width:2px 2px 0 0;}
  .sc-bl{bottom:5px;left:5px;border-width:0 0 2px 2px;}
  .sc-br{bottom:5px;right:5px;border-width:0 2px 2px 0;}
  .scan-beam {
    position:absolute; left:0; right:0; height:2px; z-index:3;
    background: linear-gradient(90deg, transparent, rgba(108,99,255,0.3), rgba(167,139,250,1), rgba(230,220,255,1), rgba(167,139,250,1), rgba(108,99,255,0.3), transparent);
    box-shadow: 0 0 12px rgba(167,139,250,0.9), 0 0 28px rgba(108,99,255,0.5);
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
    border: 2px dashed rgba(108,99,255,0.25);
    animation: dialSpin 8s linear infinite;
  }
  /* mid ring: spinning arc */
  .so-dial-mid {
    position: absolute; inset: 12px; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--accent2);
    border-right-color: rgba(167,139,250,0.35);
    animation: dialSpin 2s linear infinite;
    filter: drop-shadow(0 0 4px var(--accent));
  }
  /* inner ring: reverse */
  .so-dial-inner {
    position: absolute; inset: 24px; border-radius: 50%;
    border: 1.5px solid transparent;
    border-top-color: var(--teal);
    border-left-color: rgba(45,212,191,0.3);
    animation: dialSpin 1.4s linear infinite reverse;
    filter: drop-shadow(0 0 3px var(--teal));
  }
  @keyframes dialSpin { to { transform: rotate(360deg); } }
  /* tick marks around dial */
  .so-dial-tick {
    position: absolute; top: 50%; left: 50%;
    width: 3px; height: 8px;
    background: rgba(108,99,255,0.5);
    border-radius: 2px;
    transform-origin: 0 0;
  }
  /* core center */
  .so-dial-core {
    position: absolute; inset: 44px; border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, rgba(167,139,250,0.7), rgba(108,99,255,0.5), rgba(67,56,202,0.3));
    border: 1px solid rgba(167,139,250,0.4);
    box-shadow: 0 0 16px rgba(108,99,255,0.6), inset 0 0 10px rgba(167,139,250,0.2);
    animation: coreBeat 1.5s ease-in-out infinite;
  }
  @keyframes coreBeat {
    0%,100%{ transform:scale(1);   box-shadow:0 0 16px rgba(108,99,255,0.6); }
    50%    { transform:scale(1.2); box-shadow:0 0 28px rgba(108,99,255,0.9), 0 0 50px rgba(108,99,255,0.3); }
  }
  /* ripple from core */
  .so-dial-ripple {
    position: absolute; inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(108,99,255,0.3);
    animation: dialRipple 2s ease-out infinite;
  }
  .so-dial-ripple:nth-child(8) { animation-delay: 1s; }
  @keyframes dialRipple {
    0%   { inset: 44px; opacity: 0.8; border-color: rgba(108,99,255,0.5); }
    100% { inset: -10px; opacity: 0; border-color: rgba(108,99,255,0); }
  }

  /* Brand under dial */
  .so-brand { position:relative; z-index:5; text-align:center; }
  .so-brand-name {
    font-family:'Playfair Display',serif; font-size: clamp(15px,2.5vw,20px);
    color:var(--text); letter-spacing:0.3px; display:block;
  }
  .so-brand-sub {
    font-family:'JetBrains Mono',monospace; font-size:9px;
    color:var(--text-faint); letter-spacing:3px; text-transform:uppercase;
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
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(108,99,255,0.2);
    border-radius: 12px; overflow: hidden;
    flex: 1; max-height: 260px;
  }
  .so-terminal-bar {
    padding: 8px 14px;
    background: rgba(108,99,255,0.08);
    border-bottom: 1px solid rgba(108,99,255,0.15);
    display: flex; align-items: center; gap: 8px;
  }
  .so-term-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .so-term-dot:nth-child(1) { background: rgba(248,113,113,0.7); }
  .so-term-dot:nth-child(2) { background: rgba(245,166,35,0.7); }
  .so-term-dot:nth-child(3) { background: rgba(45,212,191,0.7); }
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
  .so-log-ts { color: rgba(108,99,255,0.55); font-size: 9px; white-space:nowrap; }
  .so-log-ok  { color: var(--teal); }
  .so-log-run { color: var(--gold); }
  .so-log-inf { color: rgba(167,139,250,0.8); }
  .so-log-txt { color: rgba(240,244,255,0.55); }
  /* blinking cursor */
  .so-cursor {
    display:inline-block; width:7px; height:12px;
    background: var(--accent2); border-radius:1px; margin-left:2px;
    vertical-align:middle;
    animation: cursorBlink 1s step-end infinite;
  }
  @keyframes cursorBlink { 0%,100%{opacity:1;} 50%{opacity:0;} }

  /* PROGRESS */
  .so-prog { }
  .so-prog-top { display:flex; justify-content:space-between; margin-bottom:8px; }
  .so-prog-lbl { font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--text-faint); text-transform:uppercase; letter-spacing:2px; }
  .so-prog-pct { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--accent2); font-weight:700; }
  .so-prog-track {
    height: 3px; background: rgba(255,255,255,0.04); border-radius:99px;
    overflow: visible; position: relative;
  }
  .so-prog-fill {
    height: 100%; border-radius: 99px; transition: width 0.4s ease;
    background: linear-gradient(90deg, #4338ca, #6c63ff, #a78bfa, #2dd4bf);
    box-shadow: 0 0 8px rgba(108,99,255,0.6);
    position: relative;
  }
  .so-prog-fill::after {
    content:''; position:absolute; right:-4px; top:50%;
    transform: translateY(-50%);
    width: 8px; height: 8px; border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 12px var(--accent2), 0 0 24px rgba(108,99,255,0.7);
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
    background:rgba(108,99,255,0.1); border-color:rgba(108,99,255,0.3);
    color:var(--accent2); box-shadow:0 0 14px rgba(108,99,255,0.1);
  }
  .so-step.done { background:rgba(45,212,191,0.05); border-color:rgba(45,212,191,0.2); color:var(--teal); }
  .so-step-ico { font-size:12px; flex-shrink:0; width:16px; text-align:center; }

  /* ── FLOATING PARTICLES (full overlay) ── */
  .scan-particles { position:absolute; inset:0; pointer-events:none; z-index:1; overflow:hidden; }
  .sp {
    position: absolute; border-radius:50%;
    animation: spFloat linear infinite;
  }
  .sp:nth-child(1)  { width:2px;height:2px;background:rgba(167,139,250,0.6);left:8%;top:85%;animation-duration:14s;animation-delay:0s; }
  .sp:nth-child(2)  { width:1px;height:1px;background:rgba(45,212,191,0.5);left:22%;top:75%;animation-duration:18s;animation-delay:-4s; }
  .sp:nth-child(3)  { width:2px;height:2px;background:rgba(245,166,35,0.5);left:38%;top:92%;animation-duration:11s;animation-delay:-7s; }
  .sp:nth-child(4)  { width:1px;height:1px;background:rgba(255,255,255,0.35);left:55%;top:88%;animation-duration:16s;animation-delay:-2s; }
  .sp:nth-child(5)  { width:2px;height:2px;background:rgba(108,99,255,0.6);left:70%;top:80%;animation-duration:13s;animation-delay:-9s; }
  .sp:nth-child(6)  { width:1px;height:1px;background:rgba(167,139,250,0.4);left:84%;top:93%;animation-duration:15s;animation-delay:-5s; }
  .sp:nth-child(7)  { width:3px;height:3px;background:rgba(45,212,191,0.4);left:92%;top:70%;animation-duration:20s;animation-delay:-3s; }
  .sp:nth-child(8)  { width:1px;height:1px;background:rgba(245,166,35,0.5);left:47%;top:97%;animation-duration:10s;animation-delay:-1s; }
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
          const parsed = JSON.parse(text);
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

  const exportReport = () => {
    if (!result) return;
    const lines = [];
    lines.push("VAIDYADRISHTI-AI — PRESCRIPTION REPORT");
    lines.push("========================================");
    if (notNull(result.patientName)) lines.push("Patient: " + result.patientName);
    if (notNull(result.doctorName))  lines.push("Doctor:  " + result.doctorName);
    if (notNull(result.date))        lines.push("Date:    " + result.date);
    if (notNull(result.generalNotes)) { lines.push(""); lines.push("Notes: " + result.generalNotes); }
    lines.push(""); lines.push("MEDICATIONS"); lines.push("-----------");
    (result.medications || []).forEach((med, i) => {
      lines.push(""); lines.push((i + 1) + ". " + med.name + (notNull(med.dosage) ? "  [" + med.dosage + "]" : ""));
      if (notNull(med.description))   lines.push("   About:        " + med.description);
      if (notNull(med.frequency))     lines.push("   Frequency:    " + med.frequency);
      if (notNull(med.duration))      lines.push("   Duration:     " + med.duration);
      if (notNull(med.quantity))      lines.push("   Quantity:     " + med.quantity);
      if (notNull(med.instructions))  lines.push("   Instructions: " + med.instructions);
    });
    lines.push(""); lines.push("Generated by VAIDYADRISHTI-AI — " + new Date().toLocaleString());
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "vaidyadrishti_" + Date.now() + ".txt"; a.click(); URL.revokeObjectURL(url);
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
        setInteractions(JSON.parse(text));
      }
    } catch(e) { setInteractions({ interactions: [], safe: true, error: true }); }
    setChecking(false);
  };

  const getConfColor = (score) => {
    if (score >= 85) return "var(--teal)";
    if (score >= 60) return "var(--accent2)";
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
                  <div className={`drop-zone${dragging ? " dz-on" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
                    <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                    <div className="dz-icon-wrap">📋</div>
                    <div>
                      <div className="dz-title">Drop your prescription here</div>
                      <div className="dz-sub">or click to browse files</div>
                    </div>
                    <div className="fmt-chips">{["JPG","PNG","WEBP"].map(f => <span key={f} className="fchip">{f}</span>)}</div>
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
            <div className="card card-enter">
              <div className="card-hdr">
                <span className="card-lbl">Analysis Results</span>
                <span className="card-tag">Step 03 — Complete</span>
              </div>
              <div className="card-body">
                {error ? (
                  <div className="err-box"><span>⚠️</span><span>{error}</span></div>
                ) : result && (
                  <>
                    {/* ACTIONS */}
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      <button className="btn-action" onClick={exportReport}>📄 Export Report</button>
                    </div>

                    {/* STATS */}
                    <div className="stats-grid">
                      <div className="stat-tile"><div className="stat-ico">💊</div><div className="stat-val">{medCount}</div><div className="stat-lbl">Medicines</div></div>
                      <div className="stat-tile"><div className="stat-ico">📏</div><div className="stat-val">{(result.medications||[]).filter(m=>notNull(m.dosage)).length}</div><div className="stat-lbl">With Dosage</div></div>
                      <div className="stat-tile"><div className="stat-ico">📝</div><div className="stat-val">{(result.medications||[]).filter(m=>notNull(m.instructions)).length}</div><div className="stat-lbl">With Notes</div></div>
                    </div>

                    {/* NOTES */}
                    {notNull(result.generalNotes) && (
                      <div className="notes-box">
                        <div className="notes-lbl">General Notes</div>
                        <div className="notes-txt">{result.generalNotes}</div>
                      </div>
                    )}

                    {/* PATIENT INFO */}
                    {(notNull(result.patientName) || notNull(result.doctorName) || notNull(result.date)) && (
                      <div className="info-box">
                        <div className="info-hdr">Prescription Info</div>
                        {notNull(result.patientName) && <div className="info-row"><span className="info-key">Patient</span><span className="info-val">{result.patientName}</span></div>}
                        {notNull(result.doctorName) && <div className="info-row"><span className="info-key">Doctor</span><span className="info-val">{result.doctorName}</span></div>}
                        {notNull(result.date) && <div className="info-row"><span className="info-key">Date</span><span className="info-val">{result.date}</span></div>}
                      </div>
                    )}

                    {/* MED CARDS */}
                    <div className="sec-div">Medications</div>
                    {(result.medications || []).length > 0
                      ? (result.medications || []).map((med, i) => (
                        <div className="med-card" key={i}>
                          <div className="mc-top">
                            <div className="mc-name-row">
                              <span className="mc-name">{med.name}</span>
                              <a className="btn-search" href={"https://www.1mg.com/search/all?name=" + encodeURIComponent(med.name)} target="_blank" rel="noopener noreferrer">🛒 1mg</a>
                              <a className="btn-search" href={"https://www.netmeds.com/catalogsearch/result?q=" + encodeURIComponent(med.name)} target="_blank" rel="noopener noreferrer">🛒 Netmeds</a>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"6px",flexShrink:0}}>
                              {notNull(med.dosage) && <span className="mc-badge">{med.dosage}</span>}
                              <button className={`btn-sm${copiedId === i ? " copied" : ""}`} onClick={() => copyMed(med, i)}>{copiedId === i ? "✓ Copied" : "📋 Copy"}</button>
                            </div>
                          </div>
                          {notNull(med.description) && <div className="mc-desc">ℹ {med.description}</div>}
                          {med.confidence != null && (
                            <div className="conf-row">
                              <span className="conf-lbl">Confidence</span>
                              <div className="conf-track"><div className="conf-fill" style={{width: med.confidence + "%", background: getConfColor(med.confidence)}} /></div>
                              <span className="conf-pct">{med.confidence}%</span>
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

                    {/* DAILY SCHEDULE */}
                    {(result.medications||[]).length > 0 && (
                      <div className="schedule-box">
                        <div className="sched-hdr">🕐 Daily Schedule</div>
                        <div className="sched-grid">
                          {Object.entries(buildSchedule(result.medications)).map(([slot, meds]) => (
                            <div className="sched-slot" key={slot}>
                              <div className="slot-time">{slot === "Morning" ? "🌅 Morning" : slot === "Afternoon" ? "☀️ Afternoon" : "🌙 Night"}</div>
                              <div className="slot-meds">
                                {meds.length === 0
                                  ? <span style={{fontSize:"11px",color:"var(--text-faint)"}}>—</span>
                                  : meds.map((m, i) => <div className="slot-med" key={i}><span className="slot-dose">{m.dose || "•"}</span><span>{m.name}</span></div>)
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DRUG INTERACTIONS */}
                    {(result.medications||[]).length >= 2 && (
                      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                        <button className="btn-danger" onClick={checkInteractions} disabled={checking}>
                          {checking ? "⏳ Checking..." : "⚠️ Check Drug Interactions"}
                        </button>
                        {interactions && (
                          <div className="int-box">
                            <div className="int-hdr">⚠️ Drug Interactions</div>
                            {interactions.safe && interactions.interactions.length === 0
                              ? <div className="int-safe">✅ No known interactions found.</div>
                              : (interactions.interactions || []).map((ix, i) => (
                                <div className="int-item" key={i}>
                                  <div className="int-pair">{ix.drug1} ↔ {ix.drug2} · {ix.severity || "moderate"}</div>
                                  <div>{ix.description}</div>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    )}

                    {/* TRANSLATE */}
                    <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                      <div className="translate-row">
                        <select className="lang-select" value={lang} onChange={e => { setLang(e.target.value); setTranslated(null); }}>
                          <option value="te">Telugu</option>
                          <option value="hi">Hindi</option>
                          <option value="ta">Tamil</option>
                          <option value="bn">Bengali</option>
                          <option value="mr">Marathi</option>
                        </select>
                        <button className="btn-action" onClick={translateResult} disabled={translating}>
                          {translating ? "⏳ Translating..." : "🌐 Translate"}
                        </button>
                      </div>
                      {translated && (
                        <div className="translated-box">
                          <div className="trans-hdr">🌐 Translated Summary</div>
                          <div className="trans-txt">{translated}</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <button className="btn-rescan" onClick={resetAll}>↩ Scan Another Prescription</button>
              </div>
            </div>
          )}
        </div>

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
                      <polygon points="26,2 50,15 50,45 26,58 2,45 2,15" fill="none" stroke="rgba(108,99,255,0.2)" strokeWidth="0.8"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="600" fill="url(#hexPat)"/>
                  {/* animated highlight hexes */}
                  {[[52,30],[156,30],[260,30],[104,90],[208,90],[52,150],[312,90],[156,150],[260,150],[104,210],[208,210],[52,270],[312,210],[26,330],[130,330],[234,330],[338,330]].map(([x,y],i)=>(
                    <polygon key={i} points={`${x+24},${y} ${x+48},${y+13} ${x+48},${y+43} ${x+24},${y+56} ${x},${y+43} ${x},${y+13}`}
                      fill={`rgba(108,99,255,${0.03 + (i%4)*0.02})`} stroke="none"
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
      </div>
    </>
  );
}
