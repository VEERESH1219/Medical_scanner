import { useState, useCallback, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #f0f4f8; --glass: rgba(255,255,255,0.75); --glass-border: rgba(11,87,64,0.12); --cyan: #0b5740; --cyan-soft: rgba(11,87,64,0.09); --emerald: #0b8c5a; --blue: #1a6fa0; --text: #0d1f1a; --text-dim: rgba(13,31,26,0.65); --text-faint: rgba(13,31,26,0.38); --red: #c0392b; --cream: #fafdf9; --mint: rgba(11,87,64,0.06); }
  body { background: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .app { min-height:100vh; background: #f0f4f8 url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230b5740' fill-opacity='0.04'%3E%3Crect x='18' y='8' width='4' height='24'/%3E%3Crect x='8' y='18' width='24' height='4'/%3E%3C/g%3E%3C/svg%3E"); color:var(--text); padding-bottom:80px; position:relative; }
  .orb { position:fixed; pointer-events:none; z-index:0; border-radius:50%; }
  .orb1 { width:600px;height:600px;background:radial-gradient(circle,rgba(11,87,64,0.06) 0%,transparent 70%);top:-200px;left:-100px;animation:floatOrb 20s ease-in-out infinite; }
  .orb2 { width:500px;height:500px;background:radial-gradient(circle,rgba(26,111,160,0.05) 0%,transparent 70%);bottom:-100px;right:-100px;animation:floatOrb 25s ease-in-out infinite reverse; }
  @keyframes floatOrb { 0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(30px,-40px) scale(1.05);}66%{transform:translate(-20px,20px) scale(0.97);} }
  .header { position:relative;z-index:10;padding:20px 40px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid rgba(11,87,64,0.12);background:#ffffff;box-shadow:0 2px 20px rgba(11,87,64,0.08); }
  @media(max-width:600px){ .header{padding:18px;} }
  .header-left{display:flex;align-items:center;gap:14px;}
  .logo{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#0b5740,#0b8c5a);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 16px rgba(11,87,64,0.3);}
  .brand h1{font-family:'Lora',serif;font-size:22px;font-weight:600;color:#0b5740;letter-spacing:-0.3px;}
  .brand p{font-size:11px;color:var(--text-faint);margin-top:2px;font-weight:500;letter-spacing:0.3px;}
  .header-badge{display:flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(11,87,64,0.08);border:1px solid rgba(11,87,64,0.2);border-radius:99px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#0b5740;font-weight:500;}
  .pulse-dot{width:6px;height:6px;border-radius:50%;background:#0b8c5a;box-shadow:0 0 6px rgba(11,140,90,0.5);animation:blink 2s ease-in-out infinite;}
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.4;}}
  .step-bar{position:relative;z-index:5;max-width:700px;margin:32px auto 0;padding:0 28px;display:flex;align-items:center;}
  .step-item{display:flex;align-items:center;gap:10px;flex:1;transition:opacity 0.4s;}
  .step-item.inactive{opacity:0.35;}
  .step-circle{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;border:1.5px solid rgba(11,87,64,0.15);background:#fff;color:var(--text-faint);transition:all 0.4s;box-shadow:0 1px 4px rgba(11,87,64,0.08);}
  .step-circle.active{background:linear-gradient(135deg,#0b5740,#0b8c5a);border-color:#0b5740;color:#fff;box-shadow:0 4px 12px rgba(11,87,64,0.3);}
  .step-circle.done{background:rgba(11,87,64,0.08);border-color:rgba(11,87,64,0.25);color:#0b5740;}
  .step-circle.scanning-pulse{animation:stepPulse 1.2s ease-in-out infinite;}
  @keyframes stepPulse{0%,100%{box-shadow:0 4px 12px rgba(11,87,64,0.3);}50%{box-shadow:0 4px 24px rgba(11,87,64,0.5);}}
  .step-info{display:flex;flex-direction:column;gap:2px;}
  .step-title{font-size:13px;font-weight:600;color:var(--text);}
  .step-sub{font-size:11px;color:var(--text-faint);font-family:'IBM Plex Mono',monospace;}
  .step-connector{flex:1;height:1px;max-width:80px;margin:0 12px;background:rgba(11,87,64,0.12);position:relative;overflow:hidden;}
  .step-connector.active::after{content:'';position:absolute;top:0;left:0;height:100%;width:100%;background:linear-gradient(90deg,#0b5740,#0b8c5a);animation:connFill 0.8s ease forwards;}
  @keyframes connFill{from{width:0%;}to{width:100%;}}
  .main-wrap{position:relative;z-index:5;max-width:900px;margin:24px auto 0;padding:0 28px;}
  @media(max-width:600px){.main-wrap{padding:0 14px;}}
  .upload-card{background:#ffffff;border:1px solid rgba(11,87,64,0.12);border-radius:20px;overflow:hidden;position:relative;transition:all 0.5s;box-shadow:0 4px 32px rgba(11,87,64,0.08);}
  .upload-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0b5740,#0b8c5a,#1a6fa0);}
  .upload-card.exit{animation:cardExit 0.5s ease forwards;}
  @keyframes cardExit{0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(0.95) translateY(-20px);}}
  .card-hdr{padding:18px 24px 16px;border-bottom:1px solid rgba(11,87,64,0.08);display:flex;align-items:center;gap:10px;background:rgba(11,87,64,0.02);}
  .card-lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#0b5740;opacity:0.7;flex:1;}
  .card-tag{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:3px 10px;border-radius:99px;background:rgba(11,87,64,0.08);color:#0b5740;border:1px solid rgba(11,87,64,0.18);font-weight:500;}
  .upload-body{padding:24px;display:flex;flex-direction:column;gap:14px;}
  .drop-zone{position:relative;border:2px dashed rgba(11,87,64,0.2);border-radius:16px;padding:48px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;cursor:pointer;transition:all 0.3s;background:rgba(11,87,64,0.02);overflow:hidden;}
  .drop-zone:hover,.drop-zone.dz-on{border-color:#0b5740;background:rgba(11,87,64,0.04);box-shadow:inset 0 0 40px rgba(11,87,64,0.04);}
  .drop-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2;}
  .dz-icon{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,rgba(11,87,64,0.1),rgba(11,140,90,0.07));border:2px solid rgba(11,87,64,0.2);display:flex;align-items:center;justify-content:center;font-size:30px;z-index:1;}
  .dz-text h3{font-size:15px;font-weight:700;color:#0b5740;text-align:center;}
  .dz-text p{font-size:12px;color:var(--text-faint);text-align:center;margin-top:4px;}
  .fmt-chips{display:flex;gap:5px;}
  .fchip{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:3px 8px;border-radius:6px;background:rgba(11,87,64,0.06);border:1px solid rgba(11,87,64,0.12);color:#0b5740;opacity:0.8;}
  .preview-wrap{position:relative;border-radius:12px;overflow:hidden;border:2px solid rgba(11,87,64,0.15);}
  .preview-wrap img{width:100%;max-height:260px;object-fit:contain;display:block;}
  .preview-lbl{position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(0deg,rgba(11,40,26,0.85),transparent);font-size:11px;color:rgba(180,240,210,0.9);font-family:'IBM Plex Mono',monospace;}
  .btn-scan{width:100%;padding:15px 20px;border:none;border-radius:12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:700;transition:all 0.25s;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#0b5740,#0b8c5a);color:#fff;box-shadow:0 4px 20px rgba(11,87,64,0.3);}
  .btn-scan:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(11,87,64,0.4);}
  .btn-scan:disabled{opacity:0.3;cursor:not-allowed;}
  .btn-clear{width:100%;padding:11px;border:1px solid rgba(11,87,64,0.15);border-radius:10px;background:transparent;color:var(--text-faint);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s;}
  .btn-clear:hover{border-color:rgba(192,57,43,0.35);color:rgba(192,57,43,0.75);}
  .scan-overlay{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;background:rgba(5,20,14,0.97);backdrop-filter:blur(16px);animation:overlayIn 0.4s ease both;}
  @keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
  .scan-overlay.exit{animation:overlayOut 0.6s ease forwards;}
  @keyframes overlayOut{0%{opacity:1;}100%{opacity:0;transform:scale(1.04);}}
  .scan-image-wrap{position:relative;width:280px;border-radius:16px;overflow:hidden;border:2px solid rgba(11,140,90,0.4);box-shadow:0 0 60px rgba(11,87,64,0.2);}
  .scan-image-wrap img{width:100%;max-height:200px;object-fit:contain;display:block;filter:brightness(0.6);}
  .laser-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#0b8c5a,#4ade80,#0b8c5a,transparent);box-shadow:0 0 12px rgba(11,140,90,0.8);animation:laserSweep 1.6s ease-in-out infinite;}
  @keyframes laserSweep{0%{top:0%;}100%{top:100%;}}
  .scan-corner{position:absolute;width:20px;height:20px;border-color:#0b8c5a;border-style:solid;}
  .sc-tl{top:8px;left:8px;border-width:2px 0 0 2px;} .sc-tr{top:8px;right:8px;border-width:2px 2px 0 0;}
  .sc-bl{bottom:8px;left:8px;border-width:0 0 2px 2px;} .sc-br{bottom:8px;right:8px;border-width:0 2px 2px 0;}
  .scan-rings-wrap{position:relative;width:90px;height:90px;display:flex;align-items:center;justify-content:center;}
  .ring{position:absolute;border-radius:50%;border:2px solid transparent;}
  .ring1{width:90px;height:90px;border-top-color:#0b8c5a;animation:spinR 1s linear infinite;}
  .ring2{width:64px;height:64px;border-top-color:#1a6fa0;animation:spinR 1.6s linear infinite reverse;}
  .ring3{width:40px;height:40px;border-top-color:#0b5740;animation:spinR 2.2s linear infinite;}
  .ring-core{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle,rgba(11,140,90,0.4),transparent);border:1px solid rgba(11,140,90,0.5);animation:corePulse 1.5s ease-in-out infinite;}
  @keyframes spinR{to{transform:rotate(360deg);}} @keyframes corePulse{0%,100%{transform:scale(1);}50%{transform:scale(1.3);}}
  .scan-prog-wrap{width:280px;}
  .scan-prog-label{display:flex;justify-content:space-between;margin-bottom:8px;}
  .scan-prog-title{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#4ade80;text-transform:uppercase;letter-spacing:1.5px;}
  .scan-prog-pct{font-family:'IBM Plex Mono',monospace;font-size:12px;color:rgba(240,255,248,0.5);}
  .scan-prog-track{height:3px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;}
  .scan-prog-fill{height:100%;background:linear-gradient(90deg,#0b5740,#4ade80);border-radius:99px;transition:width 0.3s ease;}
  .scan-steps{display:flex;flex-direction:column;gap:8px;width:280px;}
  .scan-step{display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);font-size:12px;color:rgba(200,230,215,0.5);transition:all 0.4s;}
  .scan-step.active{background:rgba(11,140,90,0.1);border-color:rgba(11,140,90,0.3);color:rgba(200,240,220,0.9);}
  .scan-step.done{background:rgba(11,87,64,0.12);border-color:rgba(11,87,64,0.25);color:rgba(74,222,128,0.8);}
  .ss-icon{font-size:14px;flex-shrink:0;}
  .results-card{background:#ffffff;border:1px solid rgba(11,87,64,0.12);border-radius:20px;overflow:hidden;position:relative;animation:cardEnter 0.6s cubic-bezier(0.16,1,0.3,1) both;box-shadow:0 4px 32px rgba(11,87,64,0.08);}
  .results-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0b5740,#0b8c5a,#1a6fa0);}
  @keyframes cardEnter{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
  .results-body{padding:22px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;}
  .results-body::-webkit-scrollbar{width:3px;}
  .results-body::-webkit-scrollbar-thumb{background:rgba(11,87,64,0.18);border-radius:99px;}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .stat-tile{padding:14px 16px;border-radius:12px;background:linear-gradient(135deg,rgba(11,87,64,0.05),rgba(11,140,90,0.03));border:1px solid rgba(11,87,64,0.1);display:flex;flex-direction:column;gap:4px;}
  .st-icon{font-size:18px;} .st-val{font-family:'Lora',serif;font-size:26px;color:#0b5740;line-height:1;font-weight:600;} .st-lbl{font-size:11px;color:var(--text-faint);}
  .notes-box{background:linear-gradient(135deg,rgba(11,87,64,0.04),rgba(11,140,90,0.02));border:1px solid rgba(11,87,64,0.14);border-left:3px solid #0b5740;border-radius:12px;padding:14px 16px;}
  .nlbl{font-family:'IBM Plex Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:#0b5740;margin-bottom:7px;font-weight:500;}
  .ntxt{font-size:13px;color:var(--text-dim);line-height:1.6;}
  .info-box{background:rgba(240,247,255,0.8);border:1px solid rgba(26,111,160,0.15);border-left:3px solid #1a6fa0;border-radius:12px;padding:14px 16px;}
  .ibox-hdr{font-family:'IBM Plex Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:#1a6fa0;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-weight:500;}
  .ibox-hdr::after{content:'';flex:1;height:1px;background:rgba(26,111,160,0.15);}
  .irow{display:flex;align-items:baseline;gap:10px;font-size:13px;margin-bottom:5px;}
  .irow:last-child{margin-bottom:0;}
  .ikey{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--text-faint);min-width:58px;text-transform:uppercase;letter-spacing:0.8px;}
  .ival{color:var(--text);font-weight:500;}
  .sec-lbl{display:flex;align-items:center;gap:10px;font-family:'IBM Plex Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:2px;color:#0b5740;opacity:0.7;}
  .sec-lbl::after{content:'';flex:1;height:1px;background:rgba(11,87,64,0.12);}
  .med-card{background:#fff;border:1px solid rgba(11,87,64,0.1);border-radius:14px;overflow:hidden;position:relative;opacity:1;margin-bottom:2px;box-shadow:0 2px 12px rgba(11,87,64,0.05);}
  .med-card:hover{border-color:rgba(11,87,64,0.25);box-shadow:0 6px 24px rgba(11,87,64,0.1);transform:translateY(-1px);}
  .med-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#0b5740,#0b8c5a,#1a6fa0);border-radius:4px 0 0 4px;}
  .mc-top{padding:14px 16px 0 19px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;}
  .mc-name{font-family:'Lora',serif;font-size:18px;color:#0d1f1a;line-height:1.2;font-weight:600;}
  .mc-badge{padding:3px 9px;background:rgba(11,87,64,0.08);border:1px solid rgba(11,87,64,0.2);border-radius:6px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:#0b5740;white-space:nowrap;flex-shrink:0;font-weight:500;}
  .mc-desc{padding:7px 16px 0 19px;font-size:12px;color:rgba(26,111,160,0.8);font-style:italic;line-height:1.5;display:flex;gap:5px;align-items:flex-start;}
  .mc-desc-i{font-size:11px;flex-shrink:0;opacity:0.7;font-style:normal;}
  .mc-div{margin:11px 16px 0 19px;height:1px;background:rgba(11,87,64,0.08);}
  .mc-details{padding:9px 16px 14px 19px;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .mc-det{display:flex;flex-direction:column;gap:2px;} .mc-det.fw{grid-column:1/-1;}
  .dlbl{font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:rgba(13,31,26,0.4);}
  .dval{font-size:12.5px;color:#0d1f1a;font-weight:600;line-height:1.4;}
  .err-box{background:rgba(192,57,43,0.05);border:1px solid rgba(192,57,43,0.2);border-left:3px solid #c0392b;border-radius:12px;padding:14px 16px;display:flex;gap:9px;align-items:flex-start;font-size:13px;color:#c0392b;line-height:1.5;}
  .btn-rescan{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border:2px solid rgba(11,87,64,0.2);border-radius:10px;background:rgba(11,87,64,0.05);color:#0b5740;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:4px;}
  .btn-rescan:hover{background:rgba(11,87,64,0.1);border-color:rgba(11,87,64,0.35);}
  .count-pill{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:3px 10px;margin-left:auto;background:rgba(11,87,64,0.08);border:1px solid rgba(11,87,64,0.18);border-radius:99px;color:#0b5740;font-weight:500;}

  /* ── COPY BUTTON ── */
  .btn-copy{padding:4px 10px;border:1px solid rgba(11,87,64,0.2);border-radius:6px;background:rgba(11,87,64,0.06);color:#0b5740;font-family:'IBM Plex Mono',monospace;font-size:10px;cursor:pointer;transition:all 0.2s;flex-shrink:0;margin-left:auto;font-weight:500;}
  .btn-copy:hover{background:rgba(11,87,64,0.12);}
  .btn-copy.copied{background:rgba(11,140,90,0.12);border-color:rgba(11,140,90,0.3);color:#0b8c5a;}
  /* ── PDF / HISTORY BUTTONS ── */
  .btn-pdf{display:flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid rgba(11,87,64,0.2);border-radius:9px;background:rgba(11,87,64,0.06);color:#0b5740;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .btn-pdf:hover{background:rgba(11,87,64,0.12);}
  .results-actions{display:flex;gap:8px;margin-bottom:4px;}
  /* ── HISTORY PANEL ── */
  .history-section{margin-top:8px;}
  .history-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
  .history-title{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#0b5740;opacity:0.6;}
  .btn-clear-history{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:3px 8px;border:1px solid rgba(192,57,43,0.2);border-radius:6px;background:transparent;color:rgba(192,57,43,0.5);cursor:pointer;transition:all 0.2s;}
  .btn-clear-history:hover{background:rgba(192,57,43,0.06);color:rgba(192,57,43,0.8);}
  .history-list{display:flex;flex-direction:column;gap:8px;}
  .history-item{padding:12px 14px;border-radius:10px;background:#fff;border:1px solid rgba(11,87,64,0.1);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 1px 6px rgba(11,87,64,0.05);}
  .history-item:hover{border-color:rgba(11,87,64,0.25);background:rgba(11,87,64,0.03);}
  .history-info{display:flex;flex-direction:column;gap:3px;}
  .history-patient{font-size:13px;font-weight:700;color:#0d1f1a;}
  .history-meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--text-faint);}
  .history-badge{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:2px 8px;background:rgba(11,87,64,0.08);border:1px solid rgba(11,87,64,0.18);border-radius:99px;color:#0b5740;white-space:nowrap;font-weight:500;}

  /* ── SEARCH LINK BUTTON ── */
  .btn-search{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border:1px solid rgba(26,111,160,0.2);border-radius:6px;background:rgba(26,111,160,0.06);color:#1a6fa0;font-family:'IBM Plex Mono',monospace;font-size:10px;cursor:pointer;text-decoration:none;transition:all 0.2s;margin-left:4px;font-weight:500;}
  .btn-search:hover{background:rgba(26,111,160,0.12);border-color:rgba(26,111,160,0.35);}
  .mc-name-row{display:flex;align-items:center;flex-wrap:wrap;gap:4px;}
  /* ── SCHEDULE ── */
  .schedule-box{background:linear-gradient(135deg,rgba(240,247,255,0.9),rgba(240,253,248,0.8));border:1px solid rgba(26,111,160,0.12);border-radius:14px;padding:14px 16px;}
  .schedule-hdr{font-family:'IBM Plex Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:#1a6fa0;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-weight:500;}
  .schedule-hdr::after{content:'';flex:1;height:1px;background:rgba(26,111,160,0.12);}
  .schedule-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
  @media(max-width:600px){.schedule-grid{grid-template-columns:1fr;}}
  .schedule-slot{border-radius:10px;background:#fff;border:1px solid rgba(11,87,64,0.1);padding:10px 12px;box-shadow:0 1px 6px rgba(11,87,64,0.04);}
  .slot-time{font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:rgba(13,31,26,0.4);margin-bottom:6px;}
  .slot-meds{display:flex;flex-direction:column;gap:4px;}
  .slot-med{font-size:12px;color:var(--text-dim);display:flex;align-items:baseline;gap:6px;}
  .slot-dose{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:#0b5740;flex-shrink:0;font-weight:600;}
  /* ── TRANSLATE ── */
  .translate-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .btn-translate{display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid rgba(11,87,64,0.2);border-radius:9px;background:rgba(11,87,64,0.06);color:#0b5740;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .btn-translate:hover{background:rgba(11,87,64,0.12);}
  .btn-translate:disabled{opacity:0.4;cursor:not-allowed;}
  .lang-select{padding:8px 12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#1e293b;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;outline:none;cursor:pointer;}
  .lang-select option{background:#fff;color:#0d1f1a;}
  .translated-box{background:rgba(240,253,248,0.8);border:1px solid rgba(11,87,64,0.15);border-left:3px solid #0b5740;border-radius:12px;padding:14px 16px;}
  .translated-hdr{font-family:'IBM Plex Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:#0b5740;margin-bottom:8px;font-weight:500;}
  .translated-text{font-size:13px;color:#0d1f1a;line-height:1.7;white-space:pre-wrap;}

  /* ── DRUG INTERACTIONS ── */
  .interaction-box{background:rgba(255,245,245,0.9);border:1px solid rgba(192,57,43,0.18);border-left:3px solid #c0392b;border-radius:12px;padding:14px 16px;}
  .interaction-hdr{font-family:'IBM Plex Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:#c0392b;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-weight:500;}
  .interaction-hdr::after{content:'';flex:1;height:1px;background:rgba(192,57,43,0.12);}
  .interaction-item{padding:8px 10px;border-radius:8px;background:rgba(192,57,43,0.04);border:1px solid rgba(192,57,43,0.1);margin-bottom:6px;font-size:12px;color:#7b1d1d;line-height:1.5;}
  .interaction-item:last-child{margin-bottom:0;}
  .interaction-pair{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#c0392b;margin-bottom:3px;font-weight:600;}
  .no-interactions{font-size:12px;color:#0b8c5a;display:flex;align-items:center;gap:6px;font-weight:500;}
  .btn-interactions{display:flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid rgba(192,57,43,0.2);border-radius:9px;background:rgba(192,57,43,0.05);color:#c0392b;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .btn-interactions:hover{background:rgba(192,57,43,0.1);}
  .btn-interactions:disabled{opacity:0.4;cursor:not-allowed;}
  /* ── CONFIDENCE SCORE ── */
  .confidence-bar{display:flex;align-items:center;gap:8px;padding:5px 16px 0 19px;}
  .conf-label{font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(13,31,26,0.4);white-space:nowrap;}
  .conf-track{flex:1;height:3px;background:rgba(11,87,64,0.08);border-radius:99px;overflow:hidden;}
  .conf-fill{height:100%;border-radius:99px;transition:width 0.6s ease;}
  .conf-pct{font-family:'IBM Plex Mono',monospace;font-size:9px;color:rgba(13,31,26,0.45);white-space:nowrap;}
  /* ── MULTI-PAGE ── */
  .multi-images{display:flex;gap:8px;flex-wrap:wrap;}
  .thumb-wrap{position:relative;width:80px;height:80px;border-radius:10px;overflow:hidden;border:2px solid rgba(11,87,64,0.15);flex-shrink:0;}
  .thumb-wrap img{width:100%;height:100%;object-fit:cover;}
  .thumb-del{position:absolute;top:3px;right:3px;width:16px;height:16px;border-radius:50%;background:rgba(239,68,68,0.8);border:none;color:#fff;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}
  .btn-add-page{width:80px;height:80px;border-radius:10px;border:2px dashed rgba(11,87,64,0.2);background:rgba(11,87,64,0.02);color:rgba(11,87,64,0.4);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
  .btn-add-page:hover{border-color:#0b5740;color:#0b5740;}
  .page-count-badge{font-family:'IBM Plex Mono',monospace;font-size:10px;padding:2px 8px;background:rgba(11,87,64,0.08);border:1px solid rgba(11,87,64,0.18);border-radius:99px;color:#0b5740;font-weight:500;}
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
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("rxscanner_history") || "[]"); } catch(e) { return []; } });
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
        '"instructions":"special notes or null","quantity":"tablet count or null","confidence":85}]}' +
        "\nRules: 1) Extract every single medication listed. 2) description is REQUIRED for every medication - never null. 3) Use JSON null (not the word null) for unknown fields. 4) confidence is 0-100 how clearly you could read that medicine name.";

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
              ...extraImages.map(img => ({ type: "image_url", image_url: { url: "data:" + img.type + ";base64," + img.base64 } })),
              { type: "text", text: prompt + (extraImages.length > 0 ? "\nNote: This prescription spans " + (1 + extraImages.length) + " pages. Extract medications from all pages." : "") }
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
    if (apiError) { setError(apiError); } else { setResult(parsed); saveToHistory(parsed); }
    setPhase("results"); setOverlayExiting(false);
  };

  const resetAll = () => {
    setPhase("upload"); setImage(null); setImageBase64(null);
    setResult(null); setError(null); setScanProgress(0);
    setActiveScanStep(0); setDoneScanSteps([]); setUploadExiting(false); setTranslated(null); setExtraImages([]); setInteractions(null);
  };

  const saveToHistory = (data) => {
    const entry = {
      id: Date.now(),
      scannedAt: new Date().toLocaleString(),
      patientName: data.patientName || "Unknown Patient",
      doctorName: data.doctorName || "Unknown Doctor",
      date: data.date || "",
      medCount: data.medications?.length || 0,
      data: data,
    };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("rxscanner_history", JSON.stringify(updated));
  };

  const copyMed = (med, id) => {
    const text = [
      "Medicine: " + med.name,
      med.dosage ? "Dosage: " + med.dosage : "",
      med.frequency ? "Frequency: " + med.frequency : "",
      med.duration ? "Duration: " + med.duration : "",
      med.instructions ? "Instructions: " + med.instructions : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const exportPDF = () => {
    if (!result) return;
    const lines = [];
    lines.push("RXSCANNER — PRESCRIPTION REPORT");
    lines.push("================================");
    if (notNull(result.patientName)) lines.push("Patient: " + result.patientName);
    if (notNull(result.doctorName))  lines.push("Doctor:  " + result.doctorName);
    if (notNull(result.date))        lines.push("Date:    " + result.date);
    if (notNull(result.generalNotes)) { lines.push(""); lines.push("Notes: " + result.generalNotes); }
    lines.push("");
    lines.push("MEDICATIONS");
    lines.push("-----------");
    (result.medications || []).forEach((med, i) => {
      lines.push("");
      lines.push((i + 1) + ". " + med.name + (notNull(med.dosage) ? "  [" + med.dosage + "]" : ""));
      if (notNull(med.description))   lines.push("   About:        " + med.description);
      if (notNull(med.frequency))     lines.push("   Frequency:    " + med.frequency);
      if (notNull(med.duration))      lines.push("   Duration:     " + med.duration);
      if (notNull(med.quantity))      lines.push("   Quantity:     " + med.quantity);
      if (notNull(med.instructions))  lines.push("   Instructions: " + med.instructions);
    });
    lines.push("");
    lines.push("Generated by RxScanner — " + new Date().toLocaleString());
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "prescription_" + Date.now() + ".txt";
    a.click(); URL.revokeObjectURL(url);
  };

  const buildSchedule = (medications) => {
    const slots = { Morning: [], Afternoon: [], Night: [] };
    (medications || []).forEach(med => {
      if (!notNull(med.name)) return;
      const freq = (med.frequency || "").toLowerCase();
      const dose = notNull(med.dosage) ? med.dosage : "";
      const entry = { name: med.name, dose };
      if (freq.includes("once") || freq.includes("1")) {
        slots.Morning.push(entry);
      } else if (freq.includes("twice") || freq.includes("2")) {
        slots.Morning.push(entry); slots.Night.push(entry);
      } else if (freq.includes("three") || freq.includes("3") || freq.includes("thrice")) {
        slots.Morning.push(entry); slots.Afternoon.push(entry); slots.Night.push(entry);
      } else {
        slots.Morning.push(entry);
      }
    });
    return slots;
  };

  const translateResult = async () => {
    if (!result || !apiKey) return;
    setTranslating(true); setTranslated(null);
    try {
      const summary = "Patient: " + (result.patientName || "N/A") + "\n" +
        "Doctor: " + (result.doctorName || "N/A") + "\n" +
        "Date: " + (result.date || "N/A") + "\n" +
        (notNull(result.generalNotes) ? "Notes: " + result.generalNotes + "\n" : "") +
        "Medications:\n" +
        (result.medications || []).map((m, i) =>
          (i+1) + ". " + m.name + (notNull(m.dosage) ? " " + m.dosage : "") +
          (notNull(m.frequency) ? ", " + m.frequency : "") +
          (notNull(m.duration) ? ", for " + m.duration : "") +
          (notNull(m.instructions) ? " (" + m.instructions + ")" : "") +
          "\n   About: " + (m.description || "")
        ).join("\n");
      const langNames = { te: "Telugu", hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi" };
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1500,
          messages: [{ role: "user", content: "Translate the following medical prescription summary to " + langNames[lang] + ". Keep medicine names in English. Be clear and simple for the patient to understand:\n\n" + summary }]
        })
      });
      const data = await res.json();
      if (data.choices) setTranslated(data.choices[0].message.content);
    } catch(e) { setTranslated("Translation failed. Please try again."); }
    setTranslating(false);
  };

  const addExtraPage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setExtraImages(prev => [...prev, { url: URL.createObjectURL(file), base64: e.target.result.split(",")[1], type: file.type }]);
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
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 800,
          messages: [{ role: "user", content: "Check for drug interactions between these medications: " + names + ". Return ONLY JSON (no markdown): {interactions:[{drug1,drug2,severity,description}],safe:boolean}. If none, return {interactions:[],safe:true}." }]
        })
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
    if (score >= 85) return "var(--emerald)";
    if (score >= 60) return "var(--cyan)";
    return "rgba(251,146,60,0.9)";
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
                {history.length > 0 && (
                  <div className="history-section">
                    <div className="history-hdr">
                      <span className="history-title">Recent Scans</span>
                      <button className="btn-clear-history" onClick={() => { setHistory([]); localStorage.removeItem("rxscanner_history"); }}>Clear</button>
                    </div>
                    <div className="history-list">
                      {history.slice(0, 5).map(h => (
                        <div className="history-item" key={h.id} onClick={() => { setResult(h.data); setPhase("results"); }}>
                          <div className="history-info">
                            <div className="history-patient">{h.patientName}</div>
                            <div className="history-meta">{h.doctorName} · {h.scannedAt}</div>
                          </div>
                          <span className="history-badge">{h.medCount} meds</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {image && (
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                      <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:"9.5px",textTransform:"uppercase",letterSpacing:"1.8px",color:"var(--text-faint)"}}>Pages</span>
                      <span className="page-count-badge">{1 + extraImages.length} page{(1 + extraImages.length) > 1 ? "s" : ""}</span>
                    </div>
                    <div className="multi-images">
                      <div className="thumb-wrap"><img src={image} alt="p1" /></div>
                      {extraImages.map((img, i) => (
                        <div className="thumb-wrap" key={i}>
                          <img src={img.url} alt={"p"+(i+2)} />
                          <button className="thumb-del" onClick={() => removeExtraPage(i)}>✕</button>
                        </div>
                      ))}
                      <label className="btn-add-page" title="Add page">
                        <input type="file" accept="image/*" style={{display:"none"}} onChange={e => { if(e.target.files[0]) addExtraPage(e.target.files[0]); e.target.value=""; }} />
                        +
                      </label>
                    </div>
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
                    <div className="results-actions">
                      <button className="btn-pdf" onClick={exportPDF}>📄 Export Report</button>
                    </div>
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
                            <div className="mc-name-row">
                              <span className="mc-name">{med.name}</span>
                              <a className="btn-search" href={"https://www.1mg.com/search/all?name=" + encodeURIComponent(med.name)} target="_blank" rel="noreferrer">🛒 1mg</a>
                              <a className="btn-search" href={"https://www.netmeds.com/catalogsearch/result?q=" + encodeURIComponent(med.name)} target="_blank" rel="noreferrer">🛒 Netmeds</a>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"6px",flexShrink:0}}>
                              {notNull(med.dosage) && <div className="mc-badge">{med.dosage}</div>}
                              <button className={"btn-copy" + (copiedId === i ? " copied" : "")} onClick={() => copyMed(med, i)}>{copiedId === i ? "✓ Copied" : "📋 Copy"}</button>
                            </div>
                          </div>
                          {notNull(med.description) && (
                            <div className="mc-desc">
                              <span className="mc-desc-i">ℹ</span>
                              <span>{med.description}</span>
                            </div>
                          )}
                          {med.confidence !== undefined && med.confidence !== null && (
                            <div className="confidence-bar">
                              <span className="conf-label">Confidence</span>
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
                  </>
                )}
                {result && result.medications && result.medications.length > 0 && (
                  <div className="schedule-box">
                    <div className="schedule-hdr">🕐 Daily Schedule</div>
                    <div className="schedule-grid">
                      {Object.entries(buildSchedule(result.medications)).map(([slot, meds]) => (
                        <div className="schedule-slot" key={slot}>
                          <div className="slot-time">{slot === "Morning" ? "🌅 Morning" : slot === "Afternoon" ? "☀️ Afternoon" : "🌙 Night"}</div>
                          <div className="slot-meds">
                            {meds.length === 0
                              ? <span style={{fontSize:"11px",color:"var(--text-faint)"}}>—</span>
                              : meds.map((m, i) => (
                                <div className="slot-med" key={i}>
                                  <span className="slot-dose">{m.dose || "•"}</span>
                                  <span>{m.name}</span>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result && result.medications && result.medications.length >= 2 && (
                  <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                    <button className="btn-interactions" onClick={checkInteractions} disabled={checking}>
                      {checking ? "⏳ Checking..." : "⚠️ Check Drug Interactions"}
                    </button>
                    {interactions && (
                      <div className="interaction-box">
                        <div className="interaction-hdr">⚠️ Drug Interactions</div>
                        {interactions.safe && interactions.interactions.length === 0
                          ? <div className="no-interactions">✅ No known interactions found between these medications.</div>
                          : (interactions.interactions || []).map((ix, i) => (
                            <div className="interaction-item" key={i}>
                              <div className="interaction-pair">{ix.drug1} ↔ {ix.drug2} · {ix.severity || "moderate"}</div>
                              <div>{ix.description}</div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )}
                {result && (
                  <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                    <div className="translate-row">
                      <select className="lang-select" value={lang} onChange={e => { setLang(e.target.value); setTranslated(null); }}>
                        <option value="te">Telugu</option>
                        <option value="hi">Hindi</option>
                        <option value="ta">Tamil</option>
                        <option value="bn">Bengali</option>
                        <option value="mr">Marathi</option>
                      </select>
                      <button className="btn-translate" onClick={translateResult} disabled={translating}>
                        {translating ? "⏳ Translating..." : "🌐 Translate"}
                      </button>
                    </div>
                    {translated && (
                      <div className="translated-box">
                        <div className="translated-hdr">🌐 Translated Summary</div>
                        <div className="translated-text">{translated}</div>
                      </div>
                    )}
                  </div>
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
