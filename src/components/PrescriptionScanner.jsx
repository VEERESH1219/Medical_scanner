import { useState, useCallback, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #030712;
    --glass: rgba(255,255,255,0.04);
    --glass-border: rgba(255,255,255,0.08);
    --cyan: #06b6d4;
    --cyan-soft: rgba(6,182,212,0.12);
    --emerald: #10b981;
    --blue: #3b82f6;
    --text: #f0f9ff;
    --text-dim: rgba(240,249,255,0.6);
    --text-faint: rgba(240,249,255,0.28);
  }

  body { background: var(--bg); font-family: 'Outfit', sans-serif; min-height: 100vh; overflow-x: hidden; }

  .app {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(6,182,212,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(59,130,246,0.08) 0%, transparent 55%),
      #030712;
    color: var(--text);
    padding-bottom: 80px;
    position: relative;
  }

  .orb { position: fixed; pointer-events: none; z-index: 0; border-radius: 50%; }
  .orb1 { width:600px;height:600px;background:radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%);top:-200px;left:-100px;animation:floatOrb 20s ease-in-out infinite; }
  .orb2 { width:500px;height:500px;background:radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%);bottom:-100px;right:-100px;animation:floatOrb 25s ease-in-out infinite reverse; }
  @keyframes floatOrb { 0%,100%{transform:translate(0,0)scale(1);}33%{transform:translate(30px,-40px)scale(1.05);}66%{transform:translate(-20px,20px)scale(0.97);} }

  /* ─── HEADER ─── */
  .header {
    position:relative;z-index:10;padding:26px 40px 22px;
    display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid rgba(255,255,255,0.06);
    backdrop-filter:blur(20px);background:rgba(3,7,18,0.7);
  }
  @media(max-width:600px){ .header{padding:18px 18px 16px;} }
  .header-left{display:flex;align-items:center;gap:14px;}
  .logo{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,rgba(6,182,212,0.25),rgba(59,130,246,0.18));border:1px solid rgba(6,182,212,0.35);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 20px rgba(6,182,212,0.18),inset 0 1px 0 rgba(255,255,255,0.1);}
  .brand h1{font-family:'Instrument Serif',serif;font-size:24px;letter-spacing:-0.3px;background:linear-gradient(135deg,#f0f9ff 30%,rgba(6,182,212,0.9));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .brand p{font-size:12px;color:var(--text-faint);margin-top:1px;}
  .header-badge{display:flex;align-items:center;gap:6px;padding:6px 14px;background:var(--cyan-soft);border:1px solid rgba(6,182,212,0.22);border-radius:99px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--cyan);}
  .pulse-dot{width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 6px var(--cyan);animation:blink 2s ease-in-out infinite;}
  @keyframes blink{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.85);}}

  /* ─── STEP INDICATOR ─── */
  .step-bar {
    position:relative;z-index:5;
    max-width:700px;margin:32px auto 0;padding:0 28px;
    display:flex;align-items:center;gap:0;
  }
  @media(max-width:600px){.step-bar{padding:0 16px;margin-top:24px;}}

  .step-item {
    display:flex;align-items:center;gap:10px;flex:1;
    transition:opacity 0.4s;
  }
  .step-item.inactive { opacity:0.35; }

  .step-circle {
    width:36px;height:36px;border-radius:50%;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:500;
    border:1.5px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.04);
    color:var(--text-faint);
    transition:all 0.4s ease;
    position:relative;
  }
  .step-circle.active {
    background:linear-gradient(135deg,rgba(6,182,212,0.25),rgba(59,130,246,0.18));
    border-color:rgba(6,182,212,0.5);
    color:var(--cyan);
    box-shadow:0 0 16px rgba(6,182,212,0.2);
  }
  .step-circle.done {
    background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.15));
    border-color:rgba(16,185,129,0.4);
    color:var(--emerald);
  }
  .step-circle.scanning-pulse {
    animation:stepPulse 1.2s ease-in-out infinite;
  }
  @keyframes stepPulse{0%,100%{box-shadow:0 0 16px rgba(6,182,212,0.2);}50%{box-shadow:0 0 28px rgba(6,182,212,0.5);}}

  .step-info { display:flex;flex-direction:column;gap:2px; }
  .step-title { font-size:13px;font-weight:600;color:var(--text-dim); }
  .step-sub { font-size:11px;color:var(--text-faint);font-family:'JetBrains Mono',monospace; }

  .step-connector {
    flex:1;height:1px;max-width:80px;margin:0 12px;
    background:linear-gradient(90deg,rgba(6,182,212,0.2),rgba(255,255,255,0.06));
    position:relative;overflow:hidden;
  }
  .step-connector.active::after {
    content:'';position:absolute;top:0;left:0;height:100%;width:100%;
    background:linear-gradient(90deg,var(--cyan),var(--blue));
    animation:connFill 0.8s ease forwards;
  }
  @keyframes connFill{from{width:0%;}to{width:100%;}}

  /* ─── MAIN LAYOUT ─── */
  .main-wrap {
    position:relative;z-index:5;
    max-width:900px;margin:24px auto 0;padding:0 28px;
  }
  @media(max-width:600px){.main-wrap{padding:0 14px;}}

  /* ─── STEP 1: UPLOAD CARD ─── */
  .upload-card {
    background:var(--glass);border:1px solid var(--glass-border);
    border-radius:24px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    overflow:hidden;position:relative;
    transition:all 0.5s ease;
  }
  .upload-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}

  .upload-card.exit {
    animation:cardExit 0.5s ease forwards;
  }
  @keyframes cardExit{0%{opacity:1;transform:scale(1)translateY(0);}100%{opacity:0;transform:scale(0.95)translateY(-20px);}}

  .card-hdr{padding:20px 24px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:10px;}
  .card-lbl{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--text-faint);flex:1;}
  .card-tag{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 10px;border-radius:99px;background:var(--cyan-soft);color:var(--cyan);border:1px solid rgba(6,182,212,0.2);}

  .upload-body{padding:24px;display:flex;flex-direction:column;gap:14px;}

  .drop-zone{
    position:relative;border:1.5px dashed rgba(255,255,255,0.09);border-radius:18px;
    padding:48px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;
    cursor:pointer;transition:all 0.3s ease;background:rgba(255,255,255,0.018);overflow:hidden;
  }
  .drop-zone::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 110%,rgba(6,182,212,0.05) 0%,transparent 65%);pointer-events:none;}
  .drop-zone:hover,.drop-zone.dz-on{border-color:rgba(6,182,212,0.45);background:rgba(6,182,212,0.03);box-shadow:inset 0 0 40px rgba(6,182,212,0.04),0 0 20px rgba(6,182,212,0.07);}
  .drop-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2;}
  .dz-icon{width:70px;height:70px;border-radius:20px;background:linear-gradient(135deg,rgba(6,182,212,0.14),rgba(59,130,246,0.1));border:1px solid rgba(6,182,212,0.2);display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 4px 20px rgba(6,182,212,0.08);transition:transform 0.3s ease;z-index:1;}
  .drop-zone:hover .dz-icon{transform:scale(1.06)translateY(-3px);}
  .dz-text h3{font-size:15px;font-weight:600;color:var(--text);text-align:center;z-index:1;}
  .dz-text p{font-size:12px;color:var(--text-faint);text-align:center;margin-top:4px;z-index:1;}
  .fmt-chips{display:flex;gap:5px;z-index:1;}
  .fchip{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:var(--text-faint);}

  .preview-wrap{position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--glass-border);background:rgba(255,255,255,0.02);}
  .preview-wrap img{width:100%;max-height:260px;object-fit:contain;display:block;}
  .preview-lbl{position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(0deg,rgba(3,7,18,0.9),transparent);font-size:11px;color:rgba(16,185,129,0.8);font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:6px;}

  .btn-scan{
    width:100%;padding:15px 20px;border:none;border-radius:14px;cursor:pointer;
    font-family:'Outfit',sans-serif;font-size:16px;font-weight:700;letter-spacing:0.3px;
    transition:all 0.25s ease;position:relative;overflow:hidden;
    display:flex;align-items:center;justify-content:center;gap:10px;
    background:linear-gradient(135deg,rgba(6,182,212,0.9),rgba(59,130,246,0.85));color:#fff;
    box-shadow:0 4px 24px rgba(6,182,212,0.25),inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .btn-scan::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);transition:left 0.5s ease;}
  .btn-scan:hover:not(:disabled)::before{left:100%;}
  .btn-scan:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 32px rgba(6,182,212,0.35);}
  .btn-scan:disabled{opacity:0.3;cursor:not-allowed;}
  .btn-clear{width:100%;padding:11px;border:1px solid rgba(255,255,255,0.07);border-radius:12px;background:transparent;color:var(--text-faint);font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s;}
  .btn-clear:hover{border-color:rgba(239,68,68,0.35);color:rgba(239,68,68,0.75);background:rgba(239,68,68,0.04);}

  /* ─── SCANNING OVERLAY (FULL SCREEN) ─── */
  .scan-overlay {
    position:fixed;inset:0;z-index:100;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;
    background:rgba(3,7,18,0.97);
    backdrop-filter:blur(16px);
    animation:overlayIn 0.4s ease both;
  }
  @keyframes overlayIn{from{opacity:0;}to{opacity:1;}}

  .scan-overlay.exit{animation:overlayOut 0.6s ease forwards;}
  @keyframes overlayOut{0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(1.04);}}

  /* scanning image preview */
  .scan-image-wrap{
    position:relative;width:280px;border-radius:20px;overflow:hidden;
    border:1px solid rgba(6,182,212,0.2);
    box-shadow:0 0 60px rgba(6,182,212,0.12);
  }
  .scan-image-wrap img{width:100%;max-height:200px;object-fit:contain;display:block;filter:brightness(0.6);}

  /* laser sweep line */
  .laser-line{
    position:absolute;left:0;right:0;height:2px;
    background:linear-gradient(90deg,transparent,var(--cyan),rgba(6,182,212,0.6),var(--cyan),transparent);
    box-shadow:0 0 12px var(--cyan),0 0 30px rgba(6,182,212,0.4);
    animation:laserSweep 1.6s ease-in-out infinite;
  }
  @keyframes laserSweep{0%{top:0%;}100%{top:100%;}}

  /* corner brackets */
  .scan-corner{position:absolute;width:20px;height:20px;border-color:var(--cyan);border-style:solid;}
  .sc-tl{top:8px;left:8px;border-width:2px 0 0 2px;border-radius:3px 0 0 0;}
  .sc-tr{top:8px;right:8px;border-width:2px 2px 0 0;border-radius:0 3px 0 0;}
  .sc-bl{bottom:8px;left:8px;border-width:0 0 2px 2px;border-radius:0 0 0 3px;}
  .sc-br{bottom:8px;right:8px;border-width:0 2px 2px 0;border-radius:0 0 3px 0;}

  /* rings */
  .scan-rings-wrap{position:relative;width:90px;height:90px;display:flex;align-items:center;justify-content:center;}
  .ring{position:absolute;border-radius:50%;border:2px solid transparent;}
  .ring1{width:90px;height:90px;border-top-color:var(--cyan);border-right-color:rgba(6,182,212,0.2);animation:spinR 1s linear infinite;}
  .ring2{width:64px;height:64px;border-top-color:var(--blue);border-left-color:rgba(59,130,246,0.2);animation:spinR 1.6s linear infinite reverse;}
  .ring3{width:40px;height:40px;border-top-color:var(--emerald);border-right-color:rgba(16,185,129,0.2);animation:spinR 2.2s linear infinite;}
  .ring-core{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.3),transparent);border:1px solid rgba(6,182,212,0.4);animation:corePulse 1.5s ease-in-out infinite;}
  @keyframes spinR{to{transform:rotate(360deg);}}
  @keyframes corePulse{0%,100%{transform:scale(1);}50%{transform:scale(1.3);}}

  /* progress bar */
  .scan-prog-wrap{width:280px;}
  .scan-prog-label{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
  .scan-prog-title{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--cyan);text-transform:uppercase;letter-spacing:1.5px;}
  .scan-prog-pct{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-faint);}
  .scan-prog-track{height:3px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;}
  .scan-prog-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--blue));border-radius:99px;transition:width 0.3s ease;}

  /* steps inside overlay */
  .scan-steps{display:flex;flex-direction:column;gap:8px;width:280px;}
  .scan-step{
    display:flex;align-items:center;gap:10px;padding:9px 13px;
    border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);
    font-size:12px;color:var(--text-faint);
    transition:all 0.4s ease;
  }
  .scan-step.active{background:rgba(6,182,212,0.06);border-color:rgba(6,182,212,0.2);color:var(--text-dim);}
  .scan-step.done{background:rgba(16,185,129,0.05);border-color:rgba(16,185,129,0.15);color:rgba(16,185,129,0.7);}
  .ss-icon{font-size:14px;flex-shrink:0;}

  /* ─── STEP 2: RESULTS ─── */
  .results-card {
    background:var(--glass);border:1px solid var(--glass-border);
    border-radius:24px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    overflow:hidden;position:relative;
    animation:cardEnter 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  .results-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(6,182,212,0.25),transparent);}
  @keyframes cardEnter{from{opacity:0;transform:translateY(30px)scale(0.97);}to{opacity:1;transform:translateY(0)scale(1);}}

  .results-body{padding:22px;display:flex;flex-direction:column;gap:14px;max-height:72vh;overflow-y:auto;}
  .results-body::-webkit-scrollbar{width:3px;}
  .results-body::-webkit-scrollbar-track{background:transparent;}
  .results-body::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.18);border-radius:99px;}

  /* stats mini bento */
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  @media(max-width:600px){.stats-grid{grid-template-columns:1fr 1fr;}}
  .stat-tile{
    padding:14px 16px;border-radius:14px;
    background:linear-gradient(135deg,rgba(6,182,212,0.06),rgba(59,130,246,0.04));
    border:1px solid rgba(6,182,212,0.12);
    display:flex;flex-direction:column;gap:4px;
    animation:tileIn 0.4s ease both;
  }
  @keyframes tileIn{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}
  .st-icon{font-size:18px;}
  .st-val{font-family:'Instrument Serif',serif;font-size:26px;color:var(--text);line-height:1;}
  .st-lbl{font-size:11px;color:var(--text-faint);}

  /* info card */
  .info-box{
    background:linear-gradient(135deg,rgba(6,182,212,0.05),rgba(59,130,246,0.03));
    border:1px solid rgba(6,182,212,0.14);border-radius:14px;padding:14px 16px;
    animation:slideIn 0.4s ease both;
  }
  .ibox-hdr{font-family:'JetBrains Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:var(--cyan);margin-bottom:10px;display:flex;align-items:center;gap:8px;}
  .ibox-hdr::after{content:'';flex:1;height:1px;background:rgba(6,182,212,0.14);}
  .irow{display:flex;align-items:baseline;gap:10px;font-size:13px;margin-bottom:5px;}
  .irow:last-child{margin-bottom:0;}
  .ikey{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--text-faint);min-width:58px;text-transform:uppercase;letter-spacing:0.8px;}
  .ival{color:var(--text);font-weight:500;}

  /* section label */
  .sec-lbl{display:flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:2px;color:var(--text-faint);}
  .sec-lbl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.06);}

  /* med card */
  .med-card{
    background:var(--glass);border:1px solid var(--glass-border);border-radius:16px;
    overflow:hidden;position:relative;
    animation:slideIn 0.45s ease both;
    transition:border-color 0.3s,box-shadow 0.3s,transform 0.2s;
  }
  .med-card:hover{border-color:rgba(6,182,212,0.18);box-shadow:0 8px 28px rgba(0,0,0,0.18);transform:translateY(-1px);}
  .med-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--cyan),var(--blue),var(--emerald));border-radius:99px 0 0 99px;}
  .med-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(6,182,212,0.22),transparent);}
  .mc-top{padding:14px 16px 0 19px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
  .mc-name{font-family:'Instrument Serif',serif;font-size:19px;color:var(--text);line-height:1.2;letter-spacing:-0.2px;}
  .mc-badge{padding:3px 9px;background:linear-gradient(135deg,rgba(6,182,212,0.14),rgba(59,130,246,0.09));border:1px solid rgba(6,182,212,0.22);border-radius:7px;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--cyan);white-space:nowrap;flex-shrink:0;}
  .mc-desc{padding:7px 16px 0 19px;font-size:12px;color:rgba(6,182,212,0.65);font-style:italic;line-height:1.5;display:flex;gap:5px;align-items:flex-start;}
  .mc-desc-i{font-size:11px;margin-top:2px;flex-shrink:0;opacity:0.7;font-style:normal;}
  .mc-div{margin:11px 16px 0 19px;height:1px;background:rgba(255,255,255,0.06);}
  .mc-details{padding:9px 16px 14px 19px;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .mc-det{display:flex;flex-direction:column;gap:2px;}
  .mc-det.fw{grid-column:1/-1;}
  .dlbl{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-faint);}
  .dval{font-size:12.5px;color:var(--text-dim);font-weight:500;line-height:1.4;}

  /* notes */
  .notes-box{background:linear-gradient(135deg,rgba(16,185,129,0.05),rgba(6,182,212,0.02));border:1px solid rgba(16,185,129,0.14);border-radius:14px;padding:14px 16px;animation:slideIn 0.5s ease both;}
  .nlbl{font-family:'JetBrains Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:var(--emerald);margin-bottom:7px;}
  .ntxt{font-size:13px;color:var(--text-dim);line-height:1.6;}

  /* error */
  .err-box{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:13px;padding:14px 16px;display:flex;gap:9px;align-items:flex-start;font-size:13px;color:rgba(252,165,165,0.88);line-height:1.5;}

  /* rescan btn */
  .btn-rescan{
    display:flex;align-items:center;justify-content:center;gap:8px;
    padding:11px 20px;border:1px solid rgba(6,182,212,0.25);border-radius:12px;
    background:var(--cyan-soft);color:var(--cyan);
    font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;
    transition:all 0.2s;margin-top:4px;
  }
  .btn-rescan:hover{background:rgba(6,182,212,0.18);box-shadow:0 4px 16px rgba(6,182,212,0.15);}

  .count-pill{font-family:'JetBrains Mono',monospace;font-size:10px;padding:3px 10px;margin-left:auto;background:linear-gradient(135deg,rgba(6,182,212,0.14),rgba(59,130,246,0.09));border:1px solid rgba(6,182,212,0.22);border-radius:99px;color:var(--cyan);}

  @keyframes slideIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
`;

// Scanning steps shown in the overlay
const SCAN_STEPS = [
  { icon: "🖼️", label: "Loading image data" },
  { icon: "🔬", label: "Analyzing prescription" },
  { icon: "💊", label: "Extracting medications" },
  { icon: "📋", label: "Compiling results" },
];

export default function PrescriptionScanner() {
  // app phase: "upload" | "scanning" | "results"
  const [phase, setPhase] = useState("upload");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env?.VITE_GROQ_API_KEY || "");

  // scanning animation state
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

  // Animate scan steps in sync with the real API call
  const animateScanSteps = useCallback(() => {
    const delays = [0, 800, 1800, 2800];
    const durations = [700, 900, 900, 600];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setActiveScanStep(i);
        setScanProgress(Math.round(((i + 1) / SCAN_STEPS.length) * 85));
      }, delay);
      setTimeout(() => {
        setDoneScanSteps(prev => [...prev, i]);
      }, delay + durations[i]);
    });
  }, []);

  const scanPrescription = async () => {
    if (!imageBase64) return;

    // 1. Animate upload card out
    setUploadExiting(true);
    await new Promise(r => setTimeout(r, 450));

    // 2. Show scanning overlay + start step animations
    setPhase("scanning");
    setScanProgress(0);
    setActiveScanStep(0);
    setDoneScanSteps([]);
    const scanStart = Date.now();
    animateScanSteps();

    let parsed = null;
    let apiError = null;

    // 3. Fire API call in parallel with animation
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${imageBase64.type};base64,${imageBase64.data}` } },
              {
                type: "text",
                text: `You are a medical prescription scanner. Analyze this image and extract ALL medication details exactly as written.
Return ONLY a JSON object (no markdown, no backticks):
{
  "patientName": "string or null",
  "doctorName": "string or null",
  "date": "string or null",
  "medications": [{
    "name": "exact name as written",
    "description": "one concise sentence about what this medicine is used for",
    "dosage": "strength e.g. 500mg",
    "frequency": "how often e.g. twice daily",
    "duration": "e.g. 7 days",
    "instructions": "special instructions e.g. after meals",
    "quantity": "number of tablets if mentioned"
  }],
  "generalNotes": "any other notes or null"
}
Extract every medication. For missing fields use JSON null (not the string "null"). Only include fields that are clearly visible in the prescription. Be precise and faithful.\`
              }
            ]
          }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error("Groq Error: " + data.error.message);
      if (!data.choices) throw new Error("No response: " + JSON.stringify(data));
      const text = data.choices[0].message.content;
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (err) {
      apiError = err.message || "Failed to scan. Please try again.";
    }

    // 4. Wait for animation to have run at least 3.5s total so all 4 steps show
    const elapsed = Date.now() - scanStart;
    const minDuration = 3600;
    if (elapsed < minDuration) {
      await new Promise(r => setTimeout(r, minDuration - elapsed));
    }

    // 5. Complete progress bar & mark all steps done
    setScanProgress(100);
    setDoneScanSteps([0, 1, 2, 3]);
    await new Promise(r => setTimeout(r, 700));

    // 6. Fade out overlay
    setOverlayExiting(true);
    await new Promise(r => setTimeout(r, 600));

    // 7. Show results
    if (apiError) setError(apiError);
    else setResult(parsed);
    setPhase("results");
    setOverlayExiting(false);
  };

  const resetAll = () => {
    setPhase("upload");
    setImage(null); setImageBase64(null);
    setResult(null); setError(null);
    setScanProgress(0); setActiveScanStep(0);
    setDoneScanSteps([]); setUploadExiting(false);
  };

  const medCount = result?.medications?.length || 0;

  // Step indicator state
  const step1Done = phase === "scanning" || phase === "results";
  const step2Active = phase === "results";

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="orb orb1" />
        <div className="orb orb2" />

        {/* ── HEADER ── */}
        <header className="header">
          <div className="header-left">
            <div className="logo">⚕️</div>
            <div className="brand">
              <h1>RxScanner</h1>
              <p>AI-powered medical prescription reader</p>
            </div>
          </div>
          <div className="header-badge">
            <div className="pulse-dot" />
            Groq Vision API
          </div>
        </header>

        {/* ── STEP INDICATOR ── */}
        <div className="step-bar">
          {/* Step 1 */}
          <div className={`step-item ${phase === "upload" ? "" : ""}`}>
            <div className={`step-circle ${phase === "upload" ? "active" : "done"}`}>
              {phase === "upload" ? "01" : "✓"}
            </div>
            <div className="step-info">
              <div className="step-title">Upload</div>
              <div className="step-sub">{phase === "upload" ? "Choose image" : "Complete"}</div>
            </div>
          </div>

          {/* Connector */}
          <div className={`step-connector ${step1Done ? "active" : ""}`} />

          {/* Step 2 (scanning) */}
          <div className={`step-item ${phase === "upload" ? "inactive" : ""}`}>
            <div className={`step-circle ${phase === "scanning" ? "active scanning-pulse" : phase === "results" ? "done" : ""}`}>
              {phase === "results" ? "✓" : "02"}
            </div>
            <div className="step-info">
              <div className="step-title">Scanning</div>
              <div className="step-sub">{phase === "scanning" ? "Analyzing..." : phase === "results" ? "Complete" : "Waiting"}</div>
            </div>
          </div>

          {/* Connector */}
          <div className={`step-connector ${step2Active ? "active" : ""}`} />

          {/* Step 3 */}
          <div className={`step-item ${phase !== "results" ? "inactive" : ""}`}>
            <div className={`step-circle ${phase === "results" ? "active" : ""}`}>
              {phase === "results" ? "03" : "03"}
            </div>
            <div className="step-info">
              <div className="step-title">Results</div>
              <div className="step-sub">{phase === "results" ? `${medCount} found` : "Pending"}</div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="main-wrap">

          {/* STEP 1 — Upload */}
          {(phase === "upload") && (
            <div className={`upload-card${uploadExiting ? " exit" : ""}`}>
              <div className="card-hdr">
                <span className="card-lbl">Prescription Image</span>
                <span className="card-tag">Step 01 — Upload</span>
              </div>
              <div className="upload-body">
                {!image ? (
                  <div
                    className={`drop-zone${dragging ? " dz-on" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                    <div className="dz-icon">📋</div>
                    <div className="dz-text">
                      <h3>Drop your prescription here</h3>
                      <p>or click to browse files</p>
                    </div>
                    <div className="fmt-chips">
                      {["JPG","PNG","WEBP","PDF"].map(f => <span key={f} className="fchip">{f}</span>)}
                    </div>
                  </div>
                ) : (
                  <div className="preview-wrap">
                    <img src={image} alt="Prescription" />
                    <div className="preview-lbl">✓ &nbsp;Image loaded — ready to scan</div>
                  </div>
                )}

                {/* API Key input */}
                <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                  <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9.5px",textTransform:"uppercase",letterSpacing:"1.8px",color:"rgba(240,249,255,0.28)"}}>
                    Anthropic API Key
                  </label>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    style={{
                      width:"100%",padding:"10px 14px",
                      background:"rgba(255,255,255,0.04)",
                      border:apiKey ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius:"10px",color:"#f0f9ff",
                      fontFamily:"'JetBrains Mono',monospace",fontSize:"13px",
                      outline:"none",transition:"border-color 0.2s",
                    }}
                  />
                  {!apiKey && (
                    <p style={{fontSize:"11px",color:"rgba(239,68,68,0.7)",fontFamily:"'JetBrains Mono',monospace"}}>
                      Enter Groq API key — get one free at console.groq.com
                    </p>
                  )}
                </div>

                <button
                  className="btn-scan"
                  onClick={scanPrescription}
                  disabled={!image || !apiKey}
                >
                  <span>🔬</span> Scan Prescription
                </button>

                {image && (
                  <button className="btn-clear" onClick={resetAll}>
                    Clear & upload new image
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Results */}
          {phase === "results" && (
            <div className="results-card">
              <div className="card-hdr">
                <span className="card-lbl">Extracted Medications</span>
                {result && <span className="count-pill">{medCount} medication{medCount !== 1 ? "s" : ""} found</span>}
              </div>

              <div className="results-body">

                {error && (
                  <div className="err-box"><span>⚠️</span><span>{error}</span></div>
                )}

                {result && (
                  <>
                    {/* Stats tiles */}
                    <div className="stats-grid">
                      {[
                        { icon:"💊", val:medCount, lbl:"Medications" },
                        { icon:"✅", val:result.medications?.filter(m=>m.dosage).length||0, lbl:"With dosage" },
                        { icon:"📋", val:result.medications?.filter(m=>m.instructions).length||0, lbl:"With instructions" },
                      ].map((s,i) => (
                        <div className="stat-tile" key={i} style={{animationDelay:`${i*80}ms`}}>
                          <div className="st-icon">{s.icon}</div>
                          <div className="st-val">{s.val}</div>
                          <div className="st-lbl">{s.lbl}</div>
                        </div>
                      ))}
                    </div>

                    {/* General Notes — top */}
                    {result.generalNotes && result.generalNotes !== 'null' && (
                      <div className="notes-box">
                        <div className="nlbl">General Notes</div>
                        <div className="ntxt">{result.generalNotes}</div>
                      </div>
                    )}

                    {/* Patient info */}
                    {(result.patientName || result.doctorName || result.date) && (
                      <div className="info-box" style={{animationDelay:"240ms"}}>
                        <div className="ibox-hdr">Prescription Info</div>
                        {result.patientName && <div className="irow"><span className="ikey">Patient</span><span className="ival">{result.patientName}</span></div>}
                        {result.doctorName && <div className="irow"><span className="ikey">Doctor</span><span className="ival">{result.doctorName}</span></div>}
                        {result.date && <div className="irow"><span className="ikey">Date</span><span className="ival">{result.date}</span></div>}
                      </div>
                    )}

                    <div className="sec-lbl">Medications</div>

                    {result.medications?.length > 0
                      ? result.medications.map((med, i) => (
                        <div className="med-card" key={i} style={{animationDelay:`${300 + i*70}ms`}}>
                          <div className="mc-top">
                            <div className="mc-name">{med.name}</div>
                            {med.dosage && med.dosage !== 'null' && <div className="mc-badge">{med.dosage}</div>}
                          </div>
                          {med.description && med.description !== 'null' && (
                            <div className="mc-desc">
                              <span className="mc-desc-i">ℹ</span>
                              <span>{med.description}</span>
                            </div>
                          )}
                          <div className="mc-div" />
                          <div className="mc-details">
                            {med.frequency && med.frequency !== 'null' && <div className="mc-det"><span className="dlbl">Frequency</span><span className="dval">{med.frequency}</span></div>}
                            {med.duration && med.duration !== 'null' && <div className="mc-det"><span className="dlbl">Duration</span><span className="dval">{med.duration}</span></div>}
                            {med.quantity && med.quantity !== 'null' && <div className="mc-det"><span className="dlbl">Quantity</span><span className="dval">{med.quantity}</span></div>}
                            {med.instructions && med.instructions !== 'null' && <div className="mc-det fw"><span className="dlbl">Instructions</span><span className="dval">{med.instructions}</span></div>}
                          </div>
                        </div>
                      ))
                      : <div className="err-box"><span>⚠️</span><span>No medications could be extracted.</span></div>
                    }

                  </>
                )}

                <button className="btn-rescan" onClick={resetAll}>
                  ↩ Scan Another Prescription
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── SCANNING OVERLAY (Phase = scanning) ── */}
        {phase === "scanning" && (
          <div className={`scan-overlay${overlayExiting ? " exit" : ""}`}>

            {/* Image with laser */}
            {image && (
              <div className="scan-image-wrap">
                <img src={image} alt="Scanning" />
                <div className="laser-line" />
                <div className="scan-corner sc-tl" />
                <div className="scan-corner sc-tr" />
                <div className="scan-corner sc-bl" />
                <div className="scan-corner sc-br" />
              </div>
            )}

            {/* Spinning rings */}
            <div className="scan-rings-wrap">
              <div className="ring ring1" />
              <div className="ring ring2" />
              <div className="ring ring3" />
              <div className="ring-core" />
            </div>

            {/* Progress bar */}
            <div className="scan-prog-wrap">
              <div className="scan-prog-label">
                <span className="scan-prog-title">Scanning</span>
                <span className="scan-prog-pct">{scanProgress}%</span>
              </div>
              <div className="scan-prog-track">
                <div className="scan-prog-fill" style={{width:`${scanProgress}%`}} />
              </div>
            </div>

            {/* Sub-steps */}
            <div className="scan-steps">
              {SCAN_STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`scan-step${activeScanStep === i && !doneScanSteps.includes(i) ? " active" : ""}${doneScanSteps.includes(i) ? " done" : ""}`}
                >
                  <span className="ss-icon">
                    {doneScanSteps.includes(i) ? "✓" : activeScanStep === i ? s.icon : "○"}
                  </span>
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
