# ⚕️ Medical Scanner — AI Prescription Reader

> An AI-powered doctor prescription scanner built with React + Vite and Claude Vision API. Upload any prescription image and instantly extract all medication details with a one-line description for each medicine.

![RxScanner](https://img.shields.io/badge/Built%20with-Claude%20Vision%20API-00e676?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)

---

## ✨ Features

- 📋 Upload prescription via drag & drop or file browser
- 🔍 AI-powered scanning using Claude Vision API
- 💊 Extracts name, dosage, frequency, duration, instructions, quantity
- ℹ️ Auto-generates a one-line description for each medicine
- 👤 Captures patient name, doctor name, and date
- 📝 Extracts general notes and instructions
- 📱 Fully responsive — works on desktop and mobile

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite 5 | Build Tool |
| Claude claude-sonnet-4-20250514 | Vision AI |
| Anthropic API | AI Backend |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Anthropic API Key → https://console.anthropic.com/

### Installation
```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/Medical_scanner.git
cd Medical_scanner

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env and add your Anthropic API key

# 4. Run the app
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure
```
Medical_scanner/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── PrescriptionScanner.jsx
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔧 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at localhost:3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🔒 Security

- Never commit your `.env` file — it's in `.gitignore`
- Images are processed client-side and sent directly to Anthropic
- No prescription data is stored on any server

---

## ⚠️ Disclaimer

For informational purposes only. Always consult your doctor or pharmacist for medical advice.

---

## 📄 License

MIT License — see LICENSE file for details.
