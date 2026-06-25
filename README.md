# Agrantara — Farmer Compliance Platform

> Solusi digital terpadu untuk efisiensi pertanian dan kepatuhan EUDR perkebunan Indonesia.

**Live Demo:** [agrantara.vercel.app](https://agrantara.vercel.app)

---

## Tentang Aplikasi

**Agrantara** adalah platform manajemen lahan pertanian berbasis web yang dirancang untuk membantu petani dan pengelola perkebunan Indonesia memenuhi persyaratan regulasi **EUDR (EU Deforestation Regulation) 2023/1115** — regulasi Uni Eropa yang mewajibkan seluruh rantai pasok komoditas bebas dari deforestasi sejak 31 Desember 2020.

Aplikasi ini memungkinkan petani untuk mendaftarkan lahan, menggambar batas polygon dengan peta interaktif, melacak siklus tanam, mengelola dokumen kepatuhan, dan memantau tingkat kepatuhan EUDR secara real-time dari satu dashboard terpadu.

---

## Fitur Utama

### Manajemen Lahan
- Daftarkan lahan dengan data lengkap: nama, komoditas, luas (hektar), koordinat GPS, dan alamat
- Lihat, edit, dan hapus data lahan dengan konfirmasi modal
- Detail lahan menampilkan semua informasi termasuk batas polygon

### Polygon Mapping (Pemetaan Spasial)
- Gambar batas wilayah lahan secara interaktif menggunakan peta Leaflet
- Simpan, edit, dan hapus polygon per lahan
- Koordinat polygon tersimpan otomatis dan ditampilkan di halaman detail lahan
- Status pemetaan (terpetakan / belum) terlihat di My Lands dan Dashboard

### EUDR Compliance
- **Pemeriksaan Kepatuhan** per lahan: cek polygon, komoditas, GPS, dan luas lahan
- **Skor kepatuhan** divisualisasikan dengan ring chart persentase
- **Due Diligence Reports** — alur proses uji tuntas 5 langkah sesuai regulasi EU
- **Certifications** — informasi sertifikasi RSPO, ISPO, Rainforest Alliance, Fairtrade, dan SNI

### Production & Crop
- **Planting Cycles** — catat siklus tanam dari pembibitan hingga panen
- **Activity & Cost Logs** — log aktivitas operasional per lahan
- **Harvest Tracing** — penelusuran rantai pasok hasil panen untuk ekspor

### Dokumen & Compliance
- **Land Documents** — upload dan kelola dokumen sertifikat, izin, dan pernyataan non-deforestasi
- Kategorisasi dokumen berdasarkan jenis (EUDR, RSPO, ISPO, dll.)

### Autentikasi
- Login dan registrasi akun petani
- **Login dengan Google** (Google OAuth 2.0)
- Validasi NIK 16 digit saat registrasi
- Ubah password langsung dari header aplikasi

### Lainnya
- **Dashboard** dengan stat cards, bar chart komoditas, ring chart kepatuhan, dan akses cepat
- **Hubungi Admin** — form kontak dengan kategori masalah dan pengiriman via email
- Tampilan responsif untuk desktop dan mobile (HP)
- Toast notifications (Sonner) menggantikan browser alert

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Inline Styles |
| Map | Leaflet + react-leaflet + react-leaflet-draw |
| Notifications | Sonner v2 |
| Auth (Google) | Google Identity Services (GIS) |
| Backend API | Yii2 REST API (eksternal) |
| Deployment | Vercel |

---

## Struktur Halaman

```
/                          → Redirect ke /dashboard
/login                     → Halaman login (+ Google Sign-In)
/register                  → Halaman registrasi (+ Google Sign-Up)
/google-auth               → Halaman verifikasi akun Google
/dashboard                 → Dashboard utama
/lands                     → Daftar semua lahan (My Lands)
/lands/[id]                → Detail lahan + polygon preview
/lands/[id]/edit           → Edit data lahan
/lands/create              → Tambah lahan baru
/land-polygon              → Polygon Mapping (tabel + kartu)
/land-polygon/manage-polygon?id=X  → Gambar/edit polygon
/land-polygon/view-polygon?id=X    → Lihat polygon (read-only)
/land-polygon/eudr-compliance?id=X → Cek kepatuhan EUDR per lahan
/planting-cycles           → Manajemen siklus tanam
/activities                → Activity & Cost Logs
/land-documents            → Dokumen lahan
/harvest-tracing           → Penelusuran panen
/certifications            → Sertifikasi keberlanjutan
/due-diligence             → Due Diligence Reports
/profile                   → Profil pengguna
/contact                   → Hubungi Admin
```

---

## Menjalankan Secara Lokal

### Prasyarat
- Node.js 18+
- npm

### Instalasi

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/Agrantara-App.git
cd Agrantara-App

# Install dependencies
npm install --legacy-peer-deps
```

### Konfigurasi Environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_APP_NAME=agrantara
NEXT_PUBLIC_APP_JARGON=Solusi digital terpadu untuk efisiensi pertanian dan perkebunan Indonesia.

# Google OAuth (opsional — tombol Google tidak muncul jika kosong)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

Untuk mengaktifkan Google Sign-In:
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorized JavaScript origins: `http://localhost:3000`
4. Salin Client ID ke `.env.local`

### Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Build Production

```bash
npm run build
npm start
```

---

## Deploy ke Vercel

1. Push ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import repository
3. Tambahkan environment variables di Settings → Environment Variables:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
4. Deploy otomatis setiap push ke branch `main`
5. Tambahkan domain Vercel ke Google Cloud Console → Authorized JavaScript origins

---

## Catatan Arsitektur

- **API Proxy** — Semua request ke backend Yii2 diteruskan melalui `/api/proxy/[...path]` untuk menghindari masalah CORS
- **Polygon Storage** — Koordinat polygon disimpan di `localStorage` dengan key `polygon_land_{id}` karena endpoint GET backend tidak mengembalikan `polygon_path`
- **Google OAuth** — Menggunakan Google Identity Services tanpa library tambahan; setelah autentikasi Google, user diarahkan ke halaman linking akun Agrantara

---

## Lisensi

Proyek ini dibuat sebagai tugas akhir mata kuliah. Hak cipta dilindungi.

---

*Dibuat dengan Next.js + Dihosting di Vercel*
