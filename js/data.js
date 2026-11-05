/**
 * data.js - Data statis untuk aplikasi Pustaka Nusantara
 * Disediakan oleh dosen. JANGAN MENGUBAH STRUKTUR/NAMA VARIABEL.
 * Catatan perbaikan:
 * - cover buku PAUD: "img/paud_perkembangan.jpg" (bukan .jpeg)
 * - Perbaikan typo waktu: "2025-08 25 14:07:56" → "2025-08-25 14:07:56"
 * - Timestamp diurutkan logis: 10:12:20, 14:07:56, 18:30:00
 */

// =============================================
// DATA PENGGUNA (Akun Login)
// =============================================
var dataPengguna = [
  {
    id: 1,
    nama: "Admin Pustaka",
    email: "admin@pustaka.com",
    password: "admin123",
    role: "Admin"
  },
  {
    id: 2,
    nama: "Budi Santoso",
    email: "budi@gmail.com",
    password: "budi123",
    role: "User"
  },
  {
    id: 3,
    nama: "Siti Rahayu",
    email: "siti@gmail.com",
    password: "siti123",
    role: "User"
  },
  {
    id: 4,
    nama: "Dewi Lestari",
    email: "dewi@gmail.com",
    password: "dewi123",
    role: "User"
  }
];

// =============================================
// DATA KATALOG BUKU
// =============================================
var dataKatalogBuku = [
  {
    kodeBarang: "BK001",
    namaBarang: "Pengantar Komunikasi",
    jenisBarang: "Komunikasi",
    edisi: "Edisi 1",
    stok: 150,
    harga: "Rp 85.000",
    cover: "img/pengantar_komunikasi.jpg"
  },
  {
    kodeBarang: "BK002",
    namaBarang: "Kepemimpinan",
    jenisBarang: "Manajemen",
    edisi: "Edisi 2",
    stok: 230,
    harga: "Rp 120.000",
    cover: "img/kepemimpinan.jpg"
  },
  {
    kodeBarang: "BK003",
    namaBarang: "Manajemen Keuangan",
    jenisBarang: "Keuangan",
    edisi: "Edisi 3",
    stok: 95,
    harga: "Rp 180.000",
    cover: "img/manajemen_keuangan.jpg"
  },
  {
    kodeBarang: "BK004",
    namaBarang: "Mikrobiologi",
    jenisBarang: "Sains",
    edisi: "Edisi 1",
    stok: 60,
    harga: "Rp 210.000",
    cover: "img/mikrobiologi.jpg"
  },
  {
    kodeBarang: "BK005",
    namaBarang: "PAUD Perkembangan Anak",
    jenisBarang: "Pendidikan",
    edisi: "Edisi 2",
    stok: 310,
    harga: "Rp 95.000",
    cover: "img/paud_perkembangan.jpg"
  }
];

// =============================================
// DATA TRACKING PENGIRIMAN
// =============================================
var dataTracking = {
  "20230012": {
    nomorDO: "20230012",
    nama: "Budi Santoso",
    status: "Terkirim",
    ekspedisi: "JNE",
    tanggalKirim: "2025-08-25",
    paket: "REG",
    total: "Rp 290.000",
    perjalanan: [
      {
        waktu: "2025-08-25 10:12:20",
        keterangan: "Paket diterima di gudang JNE Jakarta"
      },
      {
        waktu: "2025-08-25 14:07:56",
        keterangan: "Paket dalam perjalanan menuju kota tujuan"
      },
      {
        waktu: "2025-08-25 18:30:00",
        keterangan: "Paket telah tiba di kota tujuan dan siap diantar"
      },
      {
        waktu: "2025-08-26 09:15:00",
        keterangan: "Paket sedang diantarkan oleh kurir"
      },
      {
        waktu: "2025-08-26 13:45:00",
        keterangan: "Paket telah diterima oleh penerima"
      }
    ]
  },
  "20230013": {
    nomorDO: "20230013",
    nama: "Siti Rahayu",
    status: "Dalam Perjalanan",
    ekspedisi: "Pos Indonesia",
    tanggalKirim: "2025-08-26",
    paket: "Kilat Khusus",
    total: "Rp 455.000",
    perjalanan: [
      {
        waktu: "2025-08-26 08:00:00",
        keterangan: "Paket diterima di kantor Pos Indonesia"
      },
      {
        waktu: "2025-08-26 11:30:00",
        keterangan: "Paket dalam proses sortir di pusat distribusi"
      },
      {
        waktu: "2025-08-26 15:00:00",
        keterangan: "Paket dalam perjalanan ke kota tujuan"
      }
    ]
  }
};

