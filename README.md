# 👁️ VaidyaDrishti AI
### *The Next Generation of Medical Vision Intelligence*

> **VaidyaDrishti AI** is a premium, high-integrity medical prescription analysis platform. By combining cutting-edge **Groq Vision (Llama 4 Scout)** inference with a world-class **Apple-style interface**, it transforms complex medical handwriting into clear, actionable health data in under 2 seconds.

---

<p align="center">
  <img src="https://img.shields.io/badge/VaidyaDrishti-Premium%20Healthcare%20AI-0f766e?style=for-the-badge&logo=ai" />
  <img src="https://img.shields.io/badge/Design-Apple%20Minimal-22c55e?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Privacy-Zero%20Data%20Retention-06b6d4?style=for-the-badge" />
</p>

---

## 🌟 Why VaidyaDrishti AI?

In an era of rapid digital health, VaidyaDrishti bridges the gap between traditional paper prescriptions and modern healthcare management. It is designed for **speed, accuracy, and aesthetic excellence.**

### � Vision Intelligence
Powered by specialized medical prompts on the **Llama 4 Scout 17B** model, our AI doesn't just read text—it understands medical context, dosage patterns, and drug interactions with human-like intuition.

### 🎨 The Experience
Designed with a "Design-First" philosophy. From the **cinematic ECG splash animation** to the glassmorphic interactive dashboard, every pixel is crafted to provide a premium, effortless user experience.

### � Privacy by Design
Medical data is sacred. VaidyaDrishti processes everything **locally in-browser** or via secure transient API streams. No patient images or health records are ever stored on our servers.

---

## � Key Capabilities

- **⚡ Instant Digitization** — Specialized OCR for handwritten doctor notes and printed pharmacy labels.
- **📋 Intelligent Medication Cards** — Auto-parsing of dosage, frequency, duration, and instructions.
- **🕐 Smart Scheduling** — Visualize your medication journey with an auto-generated daily timeline.
- **🚨 Interaction Guard** — Real-time AI analysis to identify potential contraindications between medications.
- **🌐 Global Reach** — Instant translation of complex medical terms into 5+ major regional languages.
- **💬 One-Click Sharing** — Elegant WhatsApp report formatting and "Save as PDF" functionality.

---

## 🛠️ How it Works: End-to-End Flow

```text
┌─────────────────────────────────────────────────────┐
│                     USER                            │
│         Opens VaidyaDrishti AI in browser           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              UPLOAD / CAPTURE                       │
│   📷 Camera (mobile)  │  📂 Gallery  │  🖱 Drag Drop │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            BROWSER — FileReader API                 │
│     Converts image file → Base64 string             │
│     (Everything happens inside the browser)         │
│     Nothing uploaded to any server yet              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              REACT STATE                            │
│   imageBase64 stored in useState()                  │
│   Phase switches: "upload" → "scanning"             │
│   Nexus animation overlay appears on screen         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                GROQ API CALL #1                     │
│   POST https://api.groq.com/openai/v1/chat/...      │
│   Sends:  Base64 image + structured text prompt     │
│   Auth:   Bearer VITE_GROQ_API_KEY                  │
│   Model:  meta-llama/llama-4-scout-17b-16e-instruct │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           LLAMA 4 SCOUT (on Groq servers)           │
│   Vision model reads the prescription image         │
│   Identifies: medicine names, dosage, frequency,    │
│   duration, instructions, patient name, doctor      │
│   Returns: structured JSON response                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           SECURITY + VALIDATION LAYER               │
│   JSON.parse() the response                         │
│   validateParsed() checks schema, clamps lengths    │
│   escHtml() sanitizes values — prevents XSS         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              RESULTS PAGE RENDERED                  │
│   Hero banner with 4 stat tiles                     │
│   Medicine cards (name, dosage, confidence bar)     │
│   Sidebar (patient info, schedule, tools)           │
│   Saved to localStorage (scan history)              │
└──────┬───────────────┬───────────────┬──────────────┘
       │               │               │
       ▼               ▼               ▼
┌──────────┐   ┌──────────────┐  ┌────────────────┐
│ GROQ #2  │   │   GROQ #3    │  │  SHARE/EXPORT  │
│Translate │   │Drug Interact │  │💬 WhatsApp     │
│Telugu,   │   │Checks all    │  │🖨️ Print/PDF    │
│Hindi,    │   │medicine      │  │                │
│Tamil...  │   │combinations  │  │                │
└──────────┘   └──────────────┘  └────────────────┘
```

---

## 🛠️ The Tech Behind the Excellence

| Pillar | Technology |
|---|---|
| **Core** | React 18 + Vite 5 (Ultra-Fast Build System) |
| **Logic** | Groq Cloud (Lowest Latency AI Inference) |
| **Model** | Llama 4 Scout Vision (Medical-Grade OCR) |
| **Aesthetics** | Custom Vanilla CSS (Apple-style Interaction Design) |
| **Fonts** | Poppins & Inter (Readability Focused Typography) |

---

## 🚀 Getting Started

**Experience the future of medical scanning in 3 steps:**

1. **Clone the Excellence**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vaidyadrishti-ai.git
   npm install
   ```

2. **Secure Your Key**
   Copy `.env.example` to `.env` and insert your **Groq API Key**.

3. **Launch**
   ```bash
   npm run dev
   ```

---

## ⚠️ Medical Disclaimer
*VaidyaDrishti AI is a productivity and informational utility. It is NOT a diagnostic tool. Always cross-verify AI-generated summaries with a licensed pharmacist or your primary care physician before starting medication.*

---

<p align="center">
  <em>वैद्यदृष्टि — Empowering patients with the vision of a physician.</em>
</p>
