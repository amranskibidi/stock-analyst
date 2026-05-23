# ⚡ EQUINOX — Smart Stock Intelligence

> Platform analisis saham berbasis fundamental untuk investor cerdas Indonesia.
> Built by **Amran** | Deployed on Vercel

---

## 🚀 CARA SETUP & DEPLOY (Step-by-Step)

### Prasyarat
- Node.js versi 18+ (cek: `node -v`)
- NPM atau Yarn
- Git
- Akun GitHub
- Akun Vercel (gratis di vercel.com)

---

## LANGKAH 1 — Buat Project Next.js Baru

```bash
npx create-next-app@14 equinox --app --no-typescript --no-src-dir
```
Ketika ada pertanyaan:
- Would you like to use TypeScript? → **No**
- Would you like to use ESLint? → **Yes**
- Would you like to use Tailwind CSS? → **Yes**
- Would you like to use `src/` directory? → **No**
- Would you like to use App Router? → **Yes**
- Would you like to customize the default import alias? → **No**

```bash
cd equinox
```

---

## LANGKAH 2 — Copy File Project

Hapus file default lalu copy semua file dari project ini:

```bash
# Hapus file default
rm app/page.js app/globals.css app/layout.js

# Copy semua file (jika menggunakan zip/download):
# Ekstrak dan letakkan di folder equinox/
```

Struktur folder yang harus ada:
```
equinox/
├── app/
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── check/
│       └── page.js
├── components/
│   ├── Navbar.js
│   └── Footer.js
├── middleware.js
├── next.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## LANGKAH 3 — Install Dependencies

```bash
npm install
```

---

## LANGKAH 4 — Test di Local

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

Pastikan:
- ✅ Halaman beranda tampil dengan baik
- ✅ Halaman `/check` bisa diakses
- ✅ Form analisis saham berfungsi
- ✅ Tampilan responsif di mobile

---

## LANGKAH 5 — Build & Test Production

```bash
npm run build
npm start
```

---

## LANGKAH 6 — Push ke GitHub

### 6a. Buat repository di GitHub
1. Buka https://github.com/new
2. Nama repo: `equinox-stock`
3. Set ke **Public** (untuk free Vercel deployment)
4. Jangan centang apapun, klik **Create repository**

### 6b. Init git & push
```bash
git init
git add .
git commit -m "feat: initial commit - EQUINOX Stock Analysis Platform"
git branch -M main
git remote add origin https://github.com/USERNAME/equinox-stock.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub kamu.

---

## LANGKAH 7 — Deploy ke Vercel

### Cara 1: Via Website (Mudah)
1. Buka https://vercel.com
2. Klik **"Add New Project"**
3. Klik **"Import Git Repository"**
4. Pilih repo `equinox-stock`
5. Biarkan semua setting default
6. Klik **"Deploy"**
7. Tunggu 1-2 menit → **LIVE!** 🎉

### Cara 2: Via CLI
```bash
npm install -g vercel
vercel login
vercel
# Jawab pertanyaan:
# Set up and deploy? → Yes
# Link to existing project? → No
# Project name: equinox-stock
# Directory: ./
# Override settings? → No
vercel --prod
```

---

## LANGKAH 8 — Custom Domain (Opsional)

Di Vercel dashboard:
1. Buka project → **Settings** → **Domains**
2. Tambah domain kamu (mis: `equinox.id`)
3. Ikuti instruksi DNS
4. SSL otomatis aktif ✅

---

## 🔒 FITUR KEAMANAN

Website ini dilengkapi keamanan tinggi:

| Fitur | Status |
|-------|--------|
| HTTPS / SSL | ✅ Auto (Vercel) |
| Security Headers | ✅ X-Frame, XSS, HSTS |
| Content Security Policy | ✅ Aktif |
| Bot/DDoS Detection | ✅ Middleware |
| Anti-Clickjacking | ✅ X-Frame-Options: DENY |
| Vercel Edge Network | ✅ Anti-DDoS global |
| Rate Limiting | ✅ Via Vercel (Pro) |

Vercel secara otomatis menyediakan:
- **DDoS Protection** via Cloudflare edge network
- **SSL Certificate** otomatis (Let's Encrypt)
- **CDN Global** untuk performa tinggi
- **Bot Protection** (Vercel Enterprise)

---

## 📊 CARA MENGGUNAKAN STOCK CHECKER

1. Buka `/check`
2. Isi form:
   - **Harga Saat Ini** — harga saham hari ini (wajib)
   - **P/E Ratio** — Price to Earnings Ratio (wajib)
   - **PBV Ratio** — Price to Book Value (wajib)
   - **EPS** — Earnings Per Share
   - **BVPS** — Book Value Per Share
   - **ROE** — Return on Equity (%)
   - **DER** — Debt to Equity Ratio
   - **Revenue Growth** — Pertumbuhan revenue YoY (%)
   - **Dividend Yield** — Yield dividen (%)
   - **Net Margin** — Margin bersih (%)

3. Klik **"Analisis Saham Sekarang"**
4. Lihat hasil:
   - **Skor 0-100** dengan rating
   - **Harga Wajar** (Graham Number + P/E Method + Book Value)
   - **Margin of Safety**
   - **Breakdown per metrik** dengan progress bar

---

## 🧮 FORMULA ANALISIS

### Fair Value Methods:
- **Graham Number**: √(22.5 × EPS × BVPS)
- **P/E Fair Value**: EPS × Multiplier (12-20 tergantung sektor)
- **Book Value Method**: BVPS × ROE-adjusted multiplier

### Scoring (masing-masing 0-25 poin):
| Metrik | Skor Penuh | Kriteria |
|--------|-----------|----------|
| PBV Ratio | 25 | < 1x |
| P/E Ratio | 25 | < 8x |
| ROE | 25 | ≥ 25% |
| DER | 25 | < 0.3x |
| Bonus | +12 | Growth, Dividen, Margin |

### Rating:
- 82-100: **STRONG BUY** 🚀
- 65-81: **BUY** ✅
- 45-64: **HOLD** ⏸️
- 28-44: **SELL** ⚠️
- 0-27: **STRONG SELL** 🔴

---

## ⚠️ DISCLAIMER

Konten platform ini bersifat edukatif. Bukan merupakan saran investasi. 
Selalu lakukan riset mandiri sebelum berinvestasi di pasar modal.

---

*Crafted with ❤️ by **Amran***
