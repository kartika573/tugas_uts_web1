/**
 * script.js - Logika JavaScript Pustaka Nusantara
 * Pemrograman Web 1 - UTS
 * Semua logika JS dipusat di sini, dibagi per modul/fungsi dengan komentar.
 * Tidak ada onclick inline — semua menggunakan addEventListener.
 * Deteksi halaman aktif via document.body.dataset.page.
 */

'use strict';

/* ============================================================
   MODUL 1: UTILITAS UMUM
   ============================================================ */

/**
 * Mengubah angka menjadi format Rupiah.
 * @param {number} angka
 * @returns {string} contoh: "Rp 180.000"
 */
function formatRupiah(angka) {
  if (isNaN(angka)) return 'Rp 0';
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

/**
 * Mengubah string Rupiah menjadi angka.
 * @param {string} str contoh: "Rp 180.000"
 * @returns {number}
 */
function parseRupiah(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/[^\d]/g, ''), 10) || 0;
}

/**
 * Mengambil sesi pengguna dari sessionStorage.
 * @returns {Object|null}
 */
function getSession() {
  const data = sessionStorage.getItem('sesiPengguna');
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

/**
 * Proteksi halaman: redirect ke index.html jika belum login.
 * @returns {boolean} true jika sudah login, false jika belum (sedang redirect)
 */
function requireLogin() {
  if (!getSession()) {
    window.location.replace('index.html');
    return false;
  }
  return true;
}

/**
 * Simpan sesi pengguna ke sessionStorage.
 * @param {Object} pengguna
 */
function simpanSesi(pengguna) {
  const sesi = {
    id: pengguna.id,
    nama: pengguna.nama,
    email: pengguna.email,
    role: pengguna.role
  };
  sessionStorage.setItem('sesiPengguna', JSON.stringify(sesi));
}

/**
 * Hapus sesi dan redirect ke halaman login.
 */
function logout() {
  sessionStorage.removeItem('sesiPengguna');
  window.location.href = 'index.html';
}

/**
 * Menampilkan toast notifikasi.
 * @param {string} pesan
 * @param {'success'|'error'|'warning'|'info'} jenis
 * @param {number} durasi ms
 */
function showToast(pesan, jenis = 'info', durasi = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const ikonMap = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${jenis}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML = `<span>${ikonMap[jenis] || 'ℹ️'}</span><span>${pesan}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('keluar');
    setTimeout(() => toast.remove(), 350);
  }, durasi);
}

/**
 * Membuka modal berdasarkan ID overlay.
 * @param {string} idOverlay
 */
function bukaModal(idOverlay) {
  const overlay = document.getElementById(idOverlay);
  if (!overlay) return;
  overlay.classList.add('aktif');
  overlay.setAttribute('aria-hidden', 'false');
  // Fokus ke elemen pertama yang bisa difokus
  const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) setTimeout(() => focusable.focus(), 100);
  document.body.style.overflow = 'hidden';
}

/**
 * Menutup modal berdasarkan ID overlay.
 * @param {string} idOverlay
 */
function tutupModal(idOverlay) {
  const overlay = document.getElementById(idOverlay);
  if (!overlay) return;
  overlay.classList.remove('aktif');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Setup modal: tutup via tombol X, klik overlay, dan Esc.
 * @param {string} idOverlay
 */
function setupModal(idOverlay) {
  const overlay = document.getElementById(idOverlay);
  if (!overlay) return;

  // Tutup via klik overlay (bukan modal-box)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) tutupModal(idOverlay);
  });

  // Tombol X
  overlay.querySelectorAll('[data-tutup-modal]').forEach(btn => {
    btn.addEventListener('click', () => tutupModal(idOverlay));
  });

  // Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('aktif')) {
      tutupModal(idOverlay);
    }
  });
}

/**
 * Mendapatkan semua pengguna (data.js + localStorage).
 * @returns {Array}
 */
function semuaPengguna() {
  const lokal = JSON.parse(localStorage.getItem('penggunaBaru') || '[]');
  return [...dataPengguna, ...lokal];
}

/**
 * Mendapatkan semua buku (data.js + localStorage).
 * @returns {Array}
 */
function semuaBuku() {
  const lokal = JSON.parse(localStorage.getItem('bukuBaru') || '[]');
  return [...dataKatalogBuku, ...lokal];
}

/**
 * Mendapatkan stok aktual buku (mempertimbangkan perubahan stok di localStorage).
 * @param {string} kode
 * @returns {number}
 */
function getStokBuku(kode) {
  const perubahan = JSON.parse(localStorage.getItem('perubahanStok') || '{}');
  const semua = semuaBuku();
  const buku = semua.find(b => b.kodeBarang === kode);
  if (!buku) return 0;
  if (perubahan[kode] !== undefined) return perubahan[kode];
  return buku.stok;
}

/**
 * Update stok buku di localStorage.
 * @param {string} kode
 * @param {number} stokBaru
 */
function updateStok(kode, stokBaru) {
  const perubahan = JSON.parse(localStorage.getItem('perubahanStok') || '{}');
  perubahan[kode] = stokBaru;
  localStorage.setItem('perubahanStok', JSON.stringify(perubahan));
}

/**
 * Mendapatkan keranjang dari localStorage.
 * @returns {Array}
 */
function getKeranjang() {
  return JSON.parse(localStorage.getItem('keranjang') || '[]');
}

/**
 * Simpan keranjang ke localStorage.
 * @param {Array} keranjang
 */
function simpanKeranjang(keranjang) {
  localStorage.setItem('keranjang', JSON.stringify(keranjang));
  updateBadgeKeranjang();
}

/**
 * Update badge jumlah item keranjang di navbar.
 */
function updateBadgeKeranjang() {
  const badges = document.querySelectorAll('.cart-count-badge');
  const keranjang = getKeranjang();
  const total = keranjang.reduce((acc, item) => acc + item.qty, 0);
  badges.forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

/**
 * Mendapatkan semua transaksi dari localStorage.
 * @returns {Array}
 */
function getTransaksi() {
  return JSON.parse(localStorage.getItem('transaksi') || '[]');
}

/**
 * Format tanggal Indonesia.
 * @param {string|Date} tgl
 * @returns {string}
 */
function formatTanggal(tgl) {
  const d = new Date(tgl);
  if (isNaN(d.getTime())) return tgl;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Format tanggal pendek Indonesia.
 * @param {string|Date} tgl
 * @returns {string}
 */
function formatTanggalPendek(tgl) {
  const d = new Date(tgl);
  if (isNaN(d.getTime())) return tgl;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Tampilkan/sembunyikan pesan error form.
 * @param {HTMLElement} input
 * @param {string|null} pesan
 */
function setFieldError(input, pesan) {
  if (!input) return;
  const errorEl = input.parentElement.querySelector('.form-error') ||
                  input.closest('.form-group')?.querySelector('.form-error');
  if (errorEl) {
    errorEl.textContent = pesan || '';
    if (pesan) {
      errorEl.classList.add('tampil');
      input.classList.add('error');
      input.classList.remove('sukses');
    } else {
      errorEl.classList.remove('tampil');
      input.classList.remove('error');
    }
  }
}

/**
 * Set field sukses.
 * @param {HTMLElement} input
 */
function setFieldSukses(input) {
  if (!input) return;
  input.classList.add('sukses');
  input.classList.remove('error');
  const errorEl = input.parentElement.querySelector('.form-error') ||
                  input.closest('.form-group')?.querySelector('.form-error');
  if (errorEl) errorEl.classList.remove('tampil');
}

/**
 * Salin teks ke clipboard dengan fallback.
 * @param {string} teks
 */
function salinTeks(teks) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(teks)
      .then(() => showToast('Teks berhasil disalin!', 'success'))
      .catch(() => salinFallback(teks));
  } else {
    salinFallback(teks);
  }
}

function salinFallback(teks) {
  const el = document.createElement('textarea');
  el.value = teks;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand('copy');
    showToast('Teks berhasil disalin!', 'success');
  } catch {
    showToast('Gagal menyalin teks.', 'error');
  }
  document.body.removeChild(el);
}


/**
 * Generate Nomor DO unik.
 * @returns {string}
 */
function generateNomorDO() {
  const transaksi = getTransaksi();
  const nomorAda = new Set([
    ...Object.keys(dataTracking),
    ...transaksi.map(t => t.nomorDO)
  ]);

  let nomor;
  do {
    const angka = Math.floor(10000000 + Math.random() * 89999999);
    nomor = String(angka);
  } while (nomorAda.has(nomor));

  return nomor;
}

/* ============================================================
   MODUL 2: TEMA GELAP/TERANG
   ============================================================ */

/**
 * Terapkan tema yang tersimpan.
 */
function terapkanTema() {
  const tema = localStorage.getItem('tema') || 'light';
  document.documentElement.setAttribute('data-theme', tema);
  atuLabel();
}

/**
 * Toggle tema gelap/terang.
 */
function toggleTema() {
  const saat = document.documentElement.getAttribute('data-theme');
  const baru = saat === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', baru);
  localStorage.setItem('tema', baru);
  atuLabel();
}

function atuLabel() {
  const tema = document.documentElement.getAttribute('data-theme');
  document.querySelectorAll('.tema-label').forEach(el => {
    el.textContent = tema === 'dark' ? '☀️ Terang' : '🌙 Gelap';
  });
}

/* ============================================================
   MODUL 3: NAVBAR
   ============================================================ */

/**
 * Render navbar dinamis sesuai sesi.
 * @param {string} halamanAktif
 */
function renderNavbar(halamanAktif) {
  const sesi = getSession();
  const navbar = document.getElementById('navbar-main');
  if (!navbar) return;

  const keranjang = getKeranjang();
  const jmlKeranjang = keranjang.reduce((a, b) => a + b.qty, 0);
  const initials = sesi ? sesi.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

  const links = [
    { href: 'dashboard.html',  label: '🏠 Dashboard',     page: 'dashboard' },
    { href: 'stok.html',       label: '📚 Katalog',        page: 'stok' },
    { href: 'checkout.html',   label: '🛒 Pesan',          page: 'checkout' },
    { href: 'tracking.html',   label: '📦 Tracking',       page: 'tracking' },
    { href: 'laporan.html',    label: '📊 Laporan',        page: 'laporan' },
    { href: 'history.html',    label: '📋 History',        page: 'history' }
  ];

  const linksHtml = links.map(l => `
    <a href="${l.href}" class="nav-link ${l.page === halamanAktif ? 'aktif' : ''}" aria-label="Navigasi ke ${l.label}">
      ${l.label}
    </a>
  `).join('');

  const mobileLinksHtml = links.map(l => `
    <a href="${l.href}" class="nav-link ${l.page === halamanAktif ? 'aktif' : ''}">
      ${l.label}
    </a>
  `).join('');

  navbar.innerHTML = `
    <nav class="navbar" role="navigation" aria-label="Navigasi Utama">
      <div class="navbar-inner">
        <a href="dashboard.html" class="navbar-brand" aria-label="Pustaka Nusantara - Beranda">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#6366f1"/>
            <path d="M8 24V10c0-1.1.9-2 2-2h4v16H8zm6 0V8h8c1.1 0 2 .9 2 2v14H14z" fill="white"/>
            <rect x="10" y="12" width="2" height="2" fill="#a5b4fc"/>
            <rect x="10" y="16" width="2" height="2" fill="#a5b4fc"/>
            <rect x="16" y="12" width="4" height="2" fill="#a5b4fc"/>
            <rect x="16" y="16" width="4" height="2" fill="#a5b4fc"/>
          </svg>
          <span>Pustaka Nusantara</span>
        </a>

        <div class="navbar-nav" id="nav-links">
          ${linksHtml}
        </div>

        <div class="navbar-actions">
          <!-- Keranjang -->
          <a href="checkout.html" class="btn btn-ghost btn-icon cart-badge-wrap" aria-label="Keranjang Belanja (${jmlKeranjang} item)">
            🛒
            <span class="cart-count-badge" style="display:${jmlKeranjang > 0 ? 'flex' : 'none'}">${jmlKeranjang}</span>
          </a>

          <!-- Toggle Tema -->
          <button class="theme-toggle" id="btn-tema" aria-label="Toggle tema gelap/terang">
            <span class="tema-label">🌙 Gelap</span>
          </button>

          <!-- Profil User -->
          ${sesi ? `
          <div class="navbar-user">
            <span class="user-avatar" aria-hidden="true">${initials}</span>
            <span>${sesi.nama}</span>
            <span class="badge badge-${sesi.role === 'Admin' ? 'primary' : 'muted'}" style="font-size:0.65rem">${sesi.role}</span>
          </div>
          <button class="btn btn-sm btn-danger" id="btn-logout" aria-label="Keluar dari akun">
            🚪 Keluar
          </button>
          ` : ''}

          <!-- Hamburger Mobile -->
          <button class="hamburger" id="hamburger-btn" aria-label="Buka menu navigasi" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Nav -->
    <div class="mobile-nav" id="mobile-nav" aria-label="Menu Mobile">
      ${mobileLinksHtml}
      ${sesi ? `
      <hr class="divider" style="margin:0.5rem 0">
      <div style="padding:0.5rem 0; font-size:0.875rem; color:var(--text-muted);">
        👤 ${sesi.nama} (${sesi.role})
      </div>
      <button class="btn btn-sm btn-danger w-full" id="btn-logout-mobile">🚪 Keluar</button>
      ` : ''}
    </div>
  `;

  // Setup hamburger
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const terbuka = mobileNav.classList.toggle('terbuka');
      hamburger.classList.toggle('aktif', terbuka);
      hamburger.setAttribute('aria-expanded', terbuka);
    });
  }

  // Setup logout
  document.getElementById('btn-logout')?.addEventListener('click', () => bukaModal('modal-logout'));
  document.getElementById('btn-logout-mobile')?.addEventListener('click', () => bukaModal('modal-logout'));

  // Setup tema toggle
  document.getElementById('btn-tema')?.addEventListener('click', toggleTema);

  // Update label tema
  atuLabel();
  updateBadgeKeranjang();
}

/* ============================================================
   MODUL 4: MODAL LOGOUT GLOBAL
   ============================================================ */

/**
 * Tambahkan modal logout ke DOM (dipanggil sekali di halaman yang butuh logout).
 */
function tambahModalLogout() {
  if (document.getElementById('modal-logout')) return;
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="modal-overlay" id="modal-logout" role="dialog" aria-modal="true" aria-labelledby="logout-title" aria-hidden="true">
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <h2 class="modal-title" id="logout-title">Konfirmasi Keluar</h2>
          <button class="modal-close" data-tutup-modal aria-label="Tutup modal">✕</button>
        </div>
        <div class="modal-body" style="text-align:center;padding:2rem 1.5rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">👋</div>
          <p style="color:var(--text-secondary);margin-bottom:1.5rem;">Apakah Anda yakin ingin keluar dari akun <strong>${getSession()?.nama || ''}</strong>?</p>
          <div style="display:flex;gap:0.75rem;justify-content:center;">
            <button class="btn btn-secondary" data-tutup-modal>Batal</button>
            <button class="btn btn-danger" id="btn-konfirmasi-logout">Ya, Keluar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(div.firstElementChild);
  setupModal('modal-logout');
  document.getElementById('btn-konfirmasi-logout')?.addEventListener('click', logout);
}

/* ============================================================
   MODUL 5: TOAST CONTAINER GLOBAL
   ============================================================ */

/**
 * Pastikan toast container ada di DOM.
 */
function pastikanToastContainer() {
  if (!document.getElementById('toast-container')) {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.setAttribute('aria-live', 'polite');
    document.body.appendChild(div);
  }
}

/* ============================================================
   MODUL 6: SCROLL TO TOP
   ============================================================ */

function setupScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('tampil', window.scrollY > 300);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   MODUL 7: HALAMAN LOGIN (index.html)
   ============================================================ */

function initLogin() {
  // Jika sudah login, redirect ke dashboard
  if (getSession()) {
    window.location.href = 'dashboard.html';
    return;
  }

  terapkanTema();
  pastikanToastContainer();

  const formLogin = document.getElementById('form-login');
  const inputEmail = document.getElementById('input-email');
  const inputPassword = document.getElementById('input-password');
  const btnTampilPassword = document.getElementById('btn-tampil-password');

  // Toggle tampil/sembunyi password
  btnTampilPassword?.addEventListener('click', () => {
    const type = inputPassword.type === 'password' ? 'text' : 'password';
    inputPassword.type = type;
    btnTampilPassword.textContent = type === 'password' ? '👁️' : '🙈';
    btnTampilPassword.setAttribute('aria-label', type === 'password' ? 'Tampilkan password' : 'Sembunyikan password');
  });

  // Validasi & Submit Login
  formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const email = inputEmail.value.trim();
    const password = inputPassword.value;

    // Validasi email
    if (!email) {
      setFieldError(inputEmail, 'Email tidak boleh kosong.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(inputEmail, 'Format email tidak valid.');
      valid = false;
    } else {
      setFieldSukses(inputEmail);
    }

    // Validasi password
    if (!password) {
      setFieldError(inputPassword, 'Password tidak boleh kosong.');
      valid = false;
    } else {
      setFieldSukses(inputPassword);
    }

    if (!valid) return;

    // Cek pengguna (data.js + localStorage)
    const daftarPengguna = semuaPengguna();
    const pengguna = daftarPengguna.find(p => p.email === email && p.password === password);

    if (!pengguna) {
      // Alert bawaan sesuai soal
      alert('email/password yang anda masukkan salah');
      setFieldError(inputEmail, 'Email atau password salah.');
      setFieldError(inputPassword, 'Email atau password salah.');
      return;
    }

    // Login berhasil
    simpanSesi(pengguna);
    showToast(`Selamat datang, ${pengguna.nama}! 🎉`, 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  });

  // Setup modal Lupa Password
  setupModal('modal-lupa-password');
  document.getElementById('btn-lupa-password')?.addEventListener('click', () => {
    bukaModal('modal-lupa-password');
  });

  const formLupaPassword = document.getElementById('form-lupa-password');
  formLupaPassword?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('input-email-reset');
    const email = emailInput.value.trim();
    if (!email) {
      setFieldError(emailInput, 'Masukkan email Anda.');
      return;
    }
    const daftarPengguna = semuaPengguna();
    const ada = daftarPengguna.some(p => p.email === email);
    const pesanEl = document.getElementById('pesan-reset');
    if (ada) {
      pesanEl.textContent = '✅ Tautan reset password telah dikirim ke email Anda. Silakan cek inbox.';
      pesanEl.style.color = 'var(--clr-success)';
      setFieldSukses(emailInput);
    } else {
      pesanEl.textContent = '❌ Email tidak terdaftar dalam sistem.';
      pesanEl.style.color = 'var(--clr-danger)';
      setFieldError(emailInput, 'Email tidak terdaftar.');
    }
    pesanEl.style.display = 'block';
  });

  // Setup modal Daftar
  setupModal('modal-daftar');
  document.getElementById('btn-daftar')?.addEventListener('click', () => {
    bukaModal('modal-daftar');
  });

  const inputPasswordDaftar = document.getElementById('input-password-daftar');
  const strengthFill = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');
  const passwordStrengthEl = document.getElementById('password-strength');

  // Indikator kekuatan password saat daftar
  inputPasswordDaftar?.addEventListener('input', () => {
    const val = inputPasswordDaftar.value;
    if (!val) {
      passwordStrengthEl.classList.remove('tampil');
      return;
    }
    passwordStrengthEl.classList.add('tampil');

    let skor = 0;
    if (val.length >= 6) skor++;
    if (val.length >= 10) skor++;
    if (/[A-Z]/.test(val)) skor++;
    if (/[0-9]/.test(val)) skor++;
    if (/[^A-Za-z0-9]/.test(val)) skor++;

    const pct = (skor / 5) * 100;
    const warna = skor <= 1 ? '#ef4444' : skor <= 2 ? '#f59e0b' : skor <= 3 ? '#3b82f6' : '#10b981';
    const label = skor <= 1 ? 'Lemah' : skor <= 2 ? 'Cukup' : skor <= 3 ? 'Bagus' : 'Kuat';

    strengthFill.style.width = pct + '%';
    strengthFill.style.background = warna;
    strengthLabel.textContent = `Kekuatan: ${label}`;
    strengthLabel.style.color = warna;
  });

  // Tampil/sembunyi password daftar
  document.getElementById('btn-tampil-password-daftar')?.addEventListener('click', () => {
    const t = inputPasswordDaftar.type === 'password' ? 'text' : 'password';
    inputPasswordDaftar.type = t;
  });
  document.getElementById('btn-tampil-konfirmasi')?.addEventListener('click', () => {
    const inp = document.getElementById('input-konfirmasi-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // Submit form Daftar
  const formDaftar = document.getElementById('form-daftar');
  formDaftar?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('input-nama-daftar').value.trim();
    const email = document.getElementById('input-email-daftar').value.trim();
    const password = inputPasswordDaftar.value;
    const konfirmasi = document.getElementById('input-konfirmasi-password').value;

    const namaInput = document.getElementById('input-nama-daftar');
    const emailDaftarInput = document.getElementById('input-email-daftar');
    const konfirmasiInput = document.getElementById('input-konfirmasi-password');

    let valid = true;

    if (!nama) { setFieldError(namaInput, 'Nama lengkap wajib diisi.'); valid = false; }
    else { setFieldSukses(namaInput); }

    if (!email) { setFieldError(emailDaftarInput, 'Email wajib diisi.'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError(emailDaftarInput, 'Format email tidak valid.'); valid = false; }
    else {
      const sudahAda = semuaPengguna().some(p => p.email === email);
      if (sudahAda) { setFieldError(emailDaftarInput, 'Email sudah terdaftar.'); valid = false; }
      else { setFieldSukses(emailDaftarInput); }
    }

    if (!password) { setFieldError(inputPasswordDaftar, 'Password wajib diisi.'); valid = false; }
    else if (password.length < 6) { setFieldError(inputPasswordDaftar, 'Password minimal 6 karakter.'); valid = false; }
    else { setFieldSukses(inputPasswordDaftar); }

    if (password !== konfirmasi) { setFieldError(konfirmasiInput, 'Konfirmasi password tidak cocok.'); valid = false; }
    else if (konfirmasi) { setFieldSukses(konfirmasiInput); }

    if (!valid) return;

    // Simpan pengguna baru ke localStorage
    const penggunaBaru = JSON.parse(localStorage.getItem('penggunaBaru') || '[]');
    const idBaru = Date.now();
    penggunaBaru.push({ id: idBaru, nama, email, password, role: 'User' });
    localStorage.setItem('penggunaBaru', JSON.stringify(penggunaBaru));

    tutupModal('modal-daftar');
    showToast('Akun berhasil dibuat! Silakan login.', 'success');
    formDaftar.reset();
    if (passwordStrengthEl) passwordStrengthEl.classList.remove('tampil');

    // Prefill email di form login
    if (inputEmail) inputEmail.value = email;
  });

  // Toggle tema di halaman login
  document.getElementById('btn-tema-login')?.addEventListener('click', toggleTema);
}

/* ============================================================
   MODUL 8: HALAMAN DASHBOARD (dashboard.html)
   ============================================================ */

function initDashboard() {
  if (!requireLogin()) return;
  terapkanTema();
  pastikanToastContainer();

  const sesi = getSession();
  renderNavbar('dashboard');
  tambahModalLogout();

  // Greeting berdasarkan jam lokal
  const jam = new Date().getHours();
  let sapa = 'Selamat Malam';
  if (jam >= 4 && jam < 11)  sapa = 'Selamat Pagi';
  else if (jam >= 11 && jam < 15) sapa = 'Selamat Siang';
  else if (jam >= 15 && jam < 18) sapa = 'Selamat Sore';

  document.getElementById('greeting-teks').textContent = `${sapa}, ${sesi.nama}!`;
  document.getElementById('greeting-role').textContent = `Role: ${sesi.role}`;

  // Jam digital + tanggal
  function updateJam() {
    const now = new Date();
    const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tglStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const jamEl = document.getElementById('jam-digital');
    const tglEl = document.getElementById('tgl-sekarang');
    if (jamEl) jamEl.textContent = jamStr;
    if (tglEl) tglEl.textContent = tglStr;
  }
  updateJam();
  setInterval(updateJam, 1000);

  // Statistik
  const semuaBukuList = semuaBuku();
  const totalJudul = semuaBukuList.length;
  const totalStok  = semuaBukuList.reduce((acc, b) => acc + getStokBuku(b.kodeBarang), 0);
  const transaksi  = getTransaksi();
  const jmlTransaksi = transaksi.length;
  const totalPendapatan = transaksi.reduce((acc, t) => acc + (t.total || 0), 0);

  const elJudul = document.getElementById('stat-judul');
  const elStok  = document.getElementById('stat-stok');
  const elTransaksi = document.getElementById('stat-transaksi');
  const elPendapatan = document.getElementById('stat-pendapatan');

  if (elJudul) elJudul.textContent = totalJudul;
  if (elStok)  elStok.textContent = totalStok.toLocaleString('id-ID');
  if (elTransaksi) elTransaksi.textContent = jmlTransaksi;
  if (elPendapatan) elPendapatan.textContent = formatRupiah(totalPendapatan);

  setupScrollTop();
}

/* ============================================================
   MODUL 9: HALAMAN STOK/KATALOG (stok.html)
   ============================================================ */

function initStok() {
  if (!requireLogin()) return;
  terapkanTema();
  pastikanToastContainer();

  const sesi = getSession();
  renderNavbar('stok');
  tambahModalLogout();

  let tampilGrid = false;
  let modeBuku = semuaBuku();
  let sortField = 'namaBarang';
  let sortAsc = true;
  let filterJenis = '';
  let cariTeks = '';

  // Render tabel/grid
  function renderTabel() {
    // Filter + sort
    let data = modeBuku.map(b => ({ ...b, stokAktual: getStokBuku(b.kodeBarang) }));

    if (cariTeks) {
      const q = cariTeks.toLowerCase();
      data = data.filter(b =>
        b.namaBarang.toLowerCase().includes(q) ||
        b.kodeBarang.toLowerCase().includes(q) ||
        b.jenisBarang.toLowerCase().includes(q)
      );
    }

    if (filterJenis) {
      data = data.filter(b => b.jenisBarang === filterJenis);
    }

    data.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'stokAktual') { va = a.stokAktual; vb = b.stokAktual; }
      if (sortField === 'harga') { va = parseRupiah(a.harga); vb = parseRupiah(b.harga); }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    // Update counter
    const counter = document.getElementById('data-counter');
    if (counter) counter.textContent = `Menampilkan ${data.length} dari ${modeBuku.length} buku`;

    if (tampilGrid) {
      renderGrid(data);
    } else {
      renderTableView(data);
    }
  }

  function badgeStok(stok) {
    if (stok > 200) return `<span class="badge badge-success">Aman (${stok})</span>`;
    if (stok >= 100) return `<span class="badge badge-warning">Menipis (${stok})</span>`;
    return `<span class="badge badge-danger">Kritis (${stok})</span>`;
  }

  function renderTableView(data) {
    const kontainer = document.getElementById('kontainer-stok');
    if (!kontainer) return;

    if (data.length === 0) {
      kontainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>Tidak Ada Data</h3>
          <p>Tidak ada buku yang cocok dengan pencarian atau filter.</p>
        </div>`;
      return;
    }

    const isAdmin = sesi.role === 'Admin';

    const tabelEl = document.createElement('div');
    tabelEl.className = 'table-wrapper';

    const tabel = document.createElement('table');
    tabel.setAttribute('aria-label', 'Tabel Katalog Buku');

    // Thead
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th scope="col">Cover</th>
        <th scope="col">Kode</th>
        <th scope="col" class="sortable" data-sort="namaBarang" style="cursor:pointer;">Nama Buku ↕</th>
        <th scope="col">Jenis</th>
        <th scope="col">Edisi</th>
        <th scope="col" class="sortable" data-sort="stokAktual" style="cursor:pointer;">Stok ↕</th>
        <th scope="col" class="sortable" data-sort="harga" style="cursor:pointer;">Harga ↕</th>
        <th scope="col">Aksi</th>
      </tr>
    `;
    thead.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (sortField === field) sortAsc = !sortAsc;
        else { sortField = field; sortAsc = true; }
        renderTabel();
      });
    });

    // Tbody
    const tbody = document.createElement('tbody');
    data.forEach((buku, idx) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${idx * 0.04}s`;
      tr.classList.add('anim-fadeinup');

      const stokAktual = buku.stokAktual;
      const isStatic = dataKatalogBuku.some(b => b.kodeBarang === buku.kodeBarang);

      tr.innerHTML = `
        <td>
          <img
            src="${buku.cover || ''}"
            alt="Cover ${buku.namaBarang}"
            class="cover-thumbnail"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
          >
          <div class="cover-placeholder" style="display:none;" aria-hidden="true">📖</div>
        </td>
        <td><code style="font-size:0.8rem">${buku.kodeBarang}</code></td>
        <td><strong>${buku.namaBarang}</strong></td>
        <td><span class="badge badge-info">${buku.jenisBarang}</span></td>
        <td>${buku.edisi}</td>
        <td>${badgeStok(stokAktual)}</td>
        <td style="font-weight:600;color:var(--clr-primary-600)">${buku.harga}</td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-primary btn-tambah-ke-keranjang"
              data-kode="${buku.kodeBarang}" aria-label="Tambah ${buku.namaBarang} ke pesanan">
              🛒
            </button>
            ${isAdmin ? `
            <button class="btn btn-sm btn-warning btn-edit-stok"
              data-kode="${buku.kodeBarang}" data-stok="${stokAktual}" aria-label="Edit stok ${buku.namaBarang}">
              ✏️
            </button>
            <button class="btn btn-sm btn-danger btn-hapus-buku"
              data-kode="${buku.kodeBarang}" data-nama="${buku.namaBarang}" data-static="${isStatic}"
              aria-label="Hapus ${buku.namaBarang}">
              🗑️
            </button>
            ` : `<span class="text-muted" title="Hanya Admin yang bisa mengedit/menghapus stok" style="font-size:0.75rem;cursor:help;">🔒</span>`}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tabel.appendChild(thead);
    tabel.appendChild(tbody);
    tabelEl.appendChild(tabel);
    kontainer.innerHTML = '';
    kontainer.appendChild(tabelEl);

    // Event delegation untuk aksi buku
    tabelEl.addEventListener('click', (e) => {
      const btnKeranjang = e.target.closest('.btn-tambah-ke-keranjang');
      const btnEdit = e.target.closest('.btn-edit-stok');
      const btnHapus = e.target.closest('.btn-hapus-buku');

      if (btnKeranjang) tambahKeKeranjangDariStok(btnKeranjang.dataset.kode);
      if (btnEdit) bukaEditStok(btnEdit.dataset.kode, Number(btnEdit.dataset.stok));
      if (btnHapus) hapusBuku(btnHapus.dataset.kode, btnHapus.dataset.nama, btnHapus.dataset.static === 'true');
    });
  }

  function renderGrid(data) {
    const kontainer = document.getElementById('kontainer-stok');
    if (!kontainer) return;

    if (data.length === 0) {
      kontainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Tidak Ada Data</h3><p>Tidak ada buku yang cocok dengan pencarian.</p></div>`;
      return;
    }

    kontainer.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid-auto';

    data.forEach((buku, idx) => {
      const stokAktual = buku.stokAktual;
      const card = document.createElement('article');
      card.className = 'book-card anim-fadeinup';
      card.style.animationDelay = `${idx * 0.06}s`;
      card.innerHTML = `
        <img
          src="${buku.cover || ''}"
          alt="Cover ${buku.namaBarang}"
          class="book-card-cover"
          onerror="this.src='';this.style.background='linear-gradient(135deg,#e0e7ff,#c7d2fe)';this.style.display='block';"
        >
        <div class="book-card-body">
          <span class="badge badge-info">${buku.jenisBarang}</span>
          <h3 class="book-card-title">${buku.namaBarang}</h3>
          <p class="book-card-meta">${buku.edisi} &bull; ${buku.kodeBarang}</p>
          ${badgeStok(stokAktual)}
          <p class="book-card-price">${buku.harga}</p>
        </div>
        <div class="book-card-footer">
          <button class="btn btn-sm btn-primary w-full btn-tambah-ke-keranjang" data-kode="${buku.kodeBarang}">
            🛒 Pesan
          </button>
        </div>
      `;
      card.querySelector('.btn-tambah-ke-keranjang')?.addEventListener('click', () => {
        tambahKeKeranjangDariStok(buku.kodeBarang);
      });
      grid.appendChild(card);
    });

    kontainer.appendChild(grid);
  }

  function tambahKeKeranjangDariStok(kode) {
    const buku = semuaBuku().find(b => b.kodeBarang === kode);
    if (!buku) return;
    const stokAktual = getStokBuku(kode);
    if (stokAktual <= 0) { showToast('Stok buku habis!', 'warning'); return; }
    const keranjang = getKeranjang();
    const idx = keranjang.findIndex(item => item.kode === kode);
    if (idx >= 0) {
      if (keranjang[idx].qty >= stokAktual) { showToast('Jumlah melebihi stok!', 'warning'); return; }
      keranjang[idx].qty++;
    } else {
      keranjang.push({ kode, nama: buku.namaBarang, harga: parseRupiah(buku.harga), qty: 1, cover: buku.cover || '' });
    }
    simpanKeranjang(keranjang);
    showToast(`"${buku.namaBarang}" ditambahkan ke keranjang!`, 'success');
  }

  function bukaEditStok(kode, stokSaat) {
    const namaInput = document.getElementById('modal-edit-nama');
    const stokInput = document.getElementById('modal-edit-stok');
    const kodeInput = document.getElementById('modal-edit-kode');
    const buku = semuaBuku().find(b => b.kodeBarang === kode);
    if (namaInput) namaInput.textContent = buku?.namaBarang || kode;
    if (kodeInput) kodeInput.value = kode;
    if (stokInput) stokInput.value = stokSaat;
    bukaModal('modal-edit-stok');
  }

  function hapusBuku(kode, nama, isStatic) {
    if (isStatic) {
      showToast('Buku bawaan tidak dapat dihapus. Hanya buku yang ditambahkan secara manual yang bisa dihapus.', 'warning', 4000);
      return;
    }
    if (!confirm(`Hapus buku "${nama}"?`)) return;
    const bukuBaru = JSON.parse(localStorage.getItem('bukuBaru') || '[]').filter(b => b.kodeBarang !== kode);
    localStorage.setItem('bukuBaru', JSON.stringify(bukuBaru));
    modeBuku = semuaBuku();
    renderTabel();
    showToast(`Buku "${nama}" berhasil dihapus.`, 'success');
  }

  // Setup modal edit stok
  setupModal('modal-edit-stok');
  document.getElementById('form-edit-stok')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const kode = document.getElementById('modal-edit-kode').value;
    const stokBaru = parseInt(document.getElementById('modal-edit-stok').value);
    const stokInput = document.getElementById('modal-edit-stok');
    if (isNaN(stokBaru) || stokBaru < 0) {
      setFieldError(stokInput, 'Stok harus berupa angka >= 0.');
      return;
    }
    updateStok(kode, stokBaru);
    tutupModal('modal-edit-stok');
    modeBuku = semuaBuku();
    renderTabel();
    showToast('Stok berhasil diperbarui!', 'success');
  });

  // Setup modal tambah buku
  setupModal('modal-tambah-buku');
  document.getElementById('btn-tambah-buku')?.addEventListener('click', () => {
    if (sesi.role !== 'Admin') {
      showToast('Hanya Admin yang bisa menambah buku!', 'warning');
      return;
    }
    bukaModal('modal-tambah-buku');
  });

  document.getElementById('form-tambah-buku')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const kode   = document.getElementById('tb-kode').value.trim().toUpperCase();
    const nama   = document.getElementById('tb-nama').value.trim();
    const jenis  = document.getElementById('tb-jenis').value.trim();
    const edisi  = document.getElementById('tb-edisi').value.trim();
    const stok   = parseInt(document.getElementById('tb-stok').value);
    const harga  = parseInt(document.getElementById('tb-harga').value);

    const kodeInput  = document.getElementById('tb-kode');
    const namaInput  = document.getElementById('tb-nama');
    const jenisInput = document.getElementById('tb-jenis');
    const stokInput  = document.getElementById('tb-stok');
    const hargaInput = document.getElementById('tb-harga');

    let valid = true;

    if (!kode) { setFieldError(kodeInput, 'Kode wajib diisi.'); valid = false; }
    else if (semuaBuku().some(b => b.kodeBarang === kode)) { setFieldError(kodeInput, 'Kode sudah ada.'); valid = false; }
    else { setFieldSukses(kodeInput); }

    if (!nama) { setFieldError(namaInput, 'Nama wajib diisi.'); valid = false; }
    else { setFieldSukses(namaInput); }

    if (!jenis) { setFieldError(jenisInput, 'Jenis wajib diisi.'); valid = false; }
    else { setFieldSukses(jenisInput); }

    if (isNaN(stok) || stok < 0) { setFieldError(stokInput, 'Stok harus angka >= 0.'); valid = false; }
    else { setFieldSukses(stokInput); }

    if (isNaN(harga) || harga <= 0) { setFieldError(hargaInput, 'Harga harus angka > 0.'); valid = false; }
    else { setFieldSukses(hargaInput); }

    if (!valid) return;

    const bukuBaru = JSON.parse(localStorage.getItem('bukuBaru') || '[]');
    bukuBaru.push({
      kodeBarang: kode,
      namaBarang: nama,
      jenisBarang: jenis,
      edisi: edisi || 'Edisi 1',
      stok,
      harga: formatRupiah(harga),
      cover: ''
    });
    localStorage.setItem('bukuBaru', JSON.stringify(bukuBaru));
    modeBuku = semuaBuku();
    tutupModal('modal-tambah-buku');
    document.getElementById('form-tambah-buku').reset();
    renderTabel();
    showToast(`Buku "${nama}" berhasil ditambahkan!`, 'success');
  });

  // Pencarian & Filter
  document.getElementById('input-cari')?.addEventListener('input', (e) => {
    cariTeks = e.target.value;
    renderTabel();
  });

  document.getElementById('filter-jenis')?.addEventListener('change', (e) => {
    filterJenis = e.target.value;
    renderTabel();
  });

  // Isi filter jenis
  const selectJenis = document.getElementById('filter-jenis');
  if (selectJenis) {
    const jenisSet = [...new Set(semuaBuku().map(b => b.jenisBarang))].sort();
    jenisSet.forEach(j => {
      const opt = document.createElement('option');
      opt.value = j;
      opt.textContent = j;
      selectJenis.appendChild(opt);
    });
  }

  // Toggle tampilan tabel/grid
  document.getElementById('btn-toggle-tampilan')?.addEventListener('click', () => {
    tampilGrid = !tampilGrid;
    const btn = document.getElementById('btn-toggle-tampilan');
    if (btn) btn.textContent = tampilGrid ? '📋 Tabel' : '⊞ Grid';
    renderTabel();
  });

  // Sort header
  document.getElementById('btn-sort-nama')?.addEventListener('click', () => {
    if (sortField === 'namaBarang') sortAsc = !sortAsc; else { sortField = 'namaBarang'; sortAsc = true; }
    renderTabel();
  });

  renderTabel();

  // Tampilkan info role di banner
  const banner = document.getElementById('info-role-banner');
  if (banner && sesi) {
    if (sesi.role === 'Admin') {
      banner.innerHTML = `🛡️ Anda login sebagai <strong>Admin</strong> — dapat menambah, mengedit, dan menghapus buku.`;
    } else {
      banner.innerHTML = `👤 Anda login sebagai <strong>User</strong> — hanya dapat melihat katalog dan menambah ke keranjang. Tombol tambah/hapus stok hanya untuk Admin.`;
    }
  }

  setupScrollTop();
}

/* ============================================================
   MODUL 10: HALAMAN CHECKOUT (checkout.html)
   ============================================================ */

function initCheckout() {
  if (!requireLogin()) return;
  terapkanTema();
  pastikanToastContainer();

  const sesi = getSession();
  renderNavbar('checkout');
  tambahModalLogout();

  let keranjang = getKeranjang();

  // Render tabel keranjang
  function renderKeranjang() {
    const tbody = document.querySelector('#tabel-keranjang tbody');
    const totalEl = document.getElementById('subtotal-keranjang');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (keranjang.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">
        🛒 Keranjang kosong. <a href="stok.html">Lihat katalog buku</a>
      </td></tr>`;
      if (totalEl) totalEl.textContent = 'Rp 0';
      hitungTotal();
      return;
    }

    let subtotal = 0;
    keranjang.forEach((item, idx) => {
      const sub = item.harga * item.qty;
      subtotal += sub;
      const tr = document.createElement('tr');
      tr.dataset.idx = idx;
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <img src="${item.cover}" alt="${item.nama}" style="width:40px;height:52px;object-fit:cover;border-radius:4px;"
              onerror="this.style.display='none'">
            <strong>${item.nama}</strong>
          </div>
        </td>
        <td>${formatRupiah(item.harga)}</td>
        <td>
          <div class="qty-control">
            <button class="btn-qty-kurang" data-idx="${idx}" aria-label="Kurangi jumlah">−</button>
            <input type="number" class="input-qty" value="${item.qty}" min="1" data-idx="${idx}"
              aria-label="Jumlah ${item.nama}">
            <button class="btn-qty-tambah" data-idx="${idx}" aria-label="Tambah jumlah">+</button>
          </div>
        </td>
        <td style="font-weight:600;color:var(--clr-primary-600)">${formatRupiah(sub)}</td>
        <td>
          <button class="btn btn-sm btn-danger btn-hapus-item" data-idx="${idx}" aria-label="Hapus ${item.nama} dari keranjang">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (totalEl) totalEl.textContent = formatRupiah(subtotal);
    hitungTotal();
  }

  function hitungTotal() {
    const subtotal = keranjang.reduce((acc, item) => acc + item.harga * item.qty, 0);
    const selectedEkspedisi = document.querySelector('input[name="ekspedisi"]:checked');
    const ongkir = selectedEkspedisi ? parseInt(selectedEkspedisi.dataset.ongkir || 0) : 0;
    const total = subtotal + ongkir;

    const elSubtotal = document.getElementById('ringkasan-subtotal');
    const elOngkir   = document.getElementById('ringkasan-ongkir');
    const elTotal    = document.getElementById('ringkasan-total');

    if (elSubtotal) elSubtotal.textContent = formatRupiah(subtotal);
    if (elOngkir)   elOngkir.textContent   = formatRupiah(ongkir);
    if (elTotal)    elTotal.textContent     = formatRupiah(total);
  }

  // Event delegation untuk keranjang
  document.getElementById('tabel-keranjang')?.addEventListener('click', (e) => {
    const idx = e.target.dataset.idx;
    if (e.target.classList.contains('btn-hapus-item')) {
      keranjang.splice(Number(idx), 1);
      simpanKeranjang(keranjang);
      renderKeranjang();
    } else if (e.target.classList.contains('btn-qty-kurang')) {
      if (keranjang[idx].qty > 1) keranjang[idx].qty--;
      else { keranjang.splice(Number(idx), 1); }
      simpanKeranjang(keranjang);
      renderKeranjang();
    } else if (e.target.classList.contains('btn-qty-tambah')) {
      const stokAktual = getStokBuku(keranjang[idx].kode);
      if (keranjang[idx].qty >= stokAktual) { showToast('Jumlah melebihi stok tersedia!', 'warning'); return; }
      keranjang[idx].qty++;
      simpanKeranjang(keranjang);
      renderKeranjang();
    }
  });

  document.getElementById('tabel-keranjang')?.addEventListener('change', (e) => {
    if (e.target.classList.contains('input-qty')) {
      const idx = Number(e.target.dataset.idx);
      let qty = parseInt(e.target.value);
      const stokAktual = getStokBuku(keranjang[idx].kode);
      if (isNaN(qty) || qty < 1) qty = 1;
      if (qty > stokAktual) { qty = stokAktual; showToast('Jumlah diset ke maksimum stok.', 'warning'); }
      keranjang[idx].qty = qty;
      simpanKeranjang(keranjang);
      renderKeranjang();
    }
  });

  // Tambah dari select buku
  const selectBuku = document.getElementById('select-buku');
  const semuaBukuList = semuaBuku();

  if (selectBuku) {
    semuaBukuList.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.kodeBarang;
      const stok = getStokBuku(b.kodeBarang);
      opt.textContent = `${b.namaBarang} - ${b.harga} (Stok: ${stok})`;
      opt.disabled = stok === 0;
      selectBuku.appendChild(opt);
    });
  }

  document.getElementById('btn-tambah-ke-keranjang')?.addEventListener('click', () => {
    const kode = selectBuku?.value;
    if (!kode) { showToast('Pilih buku terlebih dahulu.', 'warning'); return; }
    const buku = semuaBukuList.find(b => b.kodeBarang === kode);
    if (!buku) return;
    const stokAktual = getStokBuku(kode);
    if (stokAktual <= 0) { showToast('Stok buku habis!', 'warning'); return; }
    const idx = keranjang.findIndex(item => item.kode === kode);
    if (idx >= 0) {
      if (keranjang[idx].qty >= stokAktual) { showToast('Jumlah melebihi stok!', 'warning'); return; }
      keranjang[idx].qty++;
    } else {
      keranjang.push({ kode, nama: buku.namaBarang, harga: parseRupiah(buku.harga), qty: 1, cover: buku.cover || '' });
    }
    simpanKeranjang(keranjang);
    renderKeranjang();
    showToast(`"${buku.namaBarang}" ditambahkan!`, 'success');
  });

  // Prefill data pemesan dari sesi
  const inputNama  = document.getElementById('pemesan-nama');
  const inputEmail = document.getElementById('pemesan-email');
  if (inputNama  && sesi) inputNama.value  = sesi.nama;
  if (inputEmail && sesi) inputEmail.value = sesi.email;

  // Metode pembayaran
  document.querySelectorAll('input[name="metode-bayar"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const val = radio.value;
      document.getElementById('field-no-kartu')?.classList.toggle('d-none', val !== 'Kartu Kredit');
      document.getElementById('field-ewallet')?.classList.toggle('d-none', val !== 'E-Wallet');
      document.getElementById('field-bank')?.classList.toggle('d-none', val !== 'Transfer Bank');
    });
  });

  // Ekspedisi - update ongkir
  document.querySelectorAll('input[name="ekspedisi"]').forEach(radio => {
    radio.addEventListener('change', hitungTotal);
  });

  // Validasi & Submit Checkout
  document.getElementById('form-checkout')?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (keranjang.length === 0) {
      showToast('Keranjang masih kosong! Tambahkan buku terlebih dahulu.', 'error');
      return;
    }

    // Validasi form pemesan
    const nama     = document.getElementById('pemesan-nama').value.trim();
    const email    = document.getElementById('pemesan-email').value.trim();
    const hp       = document.getElementById('pemesan-hp').value.trim();
    const alamat   = document.getElementById('pemesan-alamat').value.trim();
    const kota     = document.getElementById('pemesan-kota').value.trim();
    const kodePos  = document.getElementById('pemesan-kodepos').value.trim();
    const ekspedisi = document.querySelector('input[name="ekspedisi"]:checked')?.value;
    const metodeBayar = document.querySelector('input[name="metode-bayar"]:checked')?.value;

    let valid = true;
    const fields = [
      { el: document.getElementById('pemesan-nama'),    val: nama,  msg: 'Nama lengkap wajib diisi.' },
      { el: document.getElementById('pemesan-email'),   val: email, msg: 'Email wajib diisi.', extra: () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Format email tidak valid.' : null },
      { el: document.getElementById('pemesan-alamat'),  val: alamat, msg: 'Alamat wajib diisi.' },
      { el: document.getElementById('pemesan-kota'),    val: kota,  msg: 'Kota wajib diisi.' },
    ];

    fields.forEach(f => {
      if (!f.val) { setFieldError(f.el, f.msg); valid = false; }
      else if (f.extra) { const err = f.extra(); if (err) { setFieldError(f.el, err); valid = false; } else { setFieldSukses(f.el); } }
      else { setFieldSukses(f.el); }
    });

    const hpInput = document.getElementById('pemesan-hp');
    if (!hp || !/^08\d{8,11}$/.test(hp)) { setFieldError(hpInput, 'No. HP harus diawali 08 dan 10-13 digit.'); valid = false; }
    else { setFieldSukses(hpInput); }

    const kdpInput = document.getElementById('pemesan-kodepos');
    if (!kodePos || !/^\d{5}$/.test(kodePos)) { setFieldError(kdpInput, 'Kode pos harus 5 digit angka.'); valid = false; }
    else { setFieldSukses(kdpInput); }

    if (!ekspedisi) { showToast('Pilih ekspedisi pengiriman!', 'warning'); valid = false; }
    if (!metodeBayar) { showToast('Pilih metode pembayaran!', 'warning'); valid = false; }

    if (!valid) {
      showToast('Mohon perbaiki kesalahan pada form.', 'error');
      return;
    }

    // Hitung total
    const subtotal = keranjang.reduce((acc, item) => acc + item.harga * item.qty, 0);
    const ongkir = parseInt(document.querySelector('input[name="ekspedisi"]:checked')?.dataset.ongkir || 0);
    const total = subtotal + ongkir;

    // Tampilkan modal konfirmasi
    const ringkasanEl = document.getElementById('ringkasan-konfirmasi');
    if (ringkasanEl) {
      const itemsHtml = keranjang.map(item => `
        <tr>
          <td>${item.nama}</td>
          <td style="text-align:right">${item.qty}</td>
          <td style="text-align:right">${formatRupiah(item.harga * item.qty)}</td>
        </tr>
      `).join('');

      ringkasanEl.innerHTML = `
        <div style="margin-bottom:1rem;">
          <strong>Pemesan:</strong> ${nama}<br>
          <strong>Ekspedisi:</strong> ${ekspedisi}<br>
          <strong>Metode Bayar:</strong> ${metodeBayar}
        </div>
        <div class="table-wrapper" style="margin-bottom:1rem;">
          <table>
            <thead><tr><th>Buku</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
        <div class="summary-row"><span>Subtotal Buku</span><span>${formatRupiah(subtotal)}</span></div>
        <div class="summary-row"><span>Ongkos Kirim</span><span>${formatRupiah(ongkir)}</span></div>
        <div class="summary-row total"><span>TOTAL</span><span>${formatRupiah(total)}</span></div>
      `;
    }

    // Simpan data sementara untuk konfirmasi
    window._dataCheckout = { nama, email, hp, alamat, kota, kodePos, ekspedisi, metodeBayar, subtotal, ongkir, total, keranjang: [...keranjang] };
    bukaModal('modal-konfirmasi-checkout');
  });

  // Konfirmasi buat pesanan
  document.getElementById('btn-konfirmasi-pesan')?.addEventListener('click', () => {
    const d = window._dataCheckout;
    if (!d) return;

    const nomorDO = generateNomorDO();
    const tanggal = new Date().toISOString();

    // Kurangi stok
    d.keranjang.forEach(item => {
      const stokLama = getStokBuku(item.kode);
      updateStok(item.kode, Math.max(0, stokLama - item.qty));
    });

    // Simpan transaksi
    const transaksiArr = getTransaksi();
    transaksiArr.push({
      nomorDO,
      tanggal,
      nama: d.nama,
      email: d.email,
      hp: d.hp,
      alamat: d.alamat,
      kota: d.kota,
      kodePos: d.kodePos,
      ekspedisi: d.ekspedisi,
      metodeBayar: d.metodeBayar,
      items: d.keranjang,
      subtotal: d.subtotal,
      ongkir: d.ongkir,
      total: d.total,
      status: 'Diproses',
      perjalanan: [
        { waktu: tanggal, keterangan: 'Pesanan diterima dan sedang diproses' }
      ]
    });
    localStorage.setItem('transaksi', JSON.stringify(transaksiArr));

    // Kosongkan keranjang
    simpanKeranjang([]);
    keranjang = [];

    tutupModal('modal-konfirmasi-checkout');

    // Tampilkan modal sukses
    document.getElementById('do-berhasil').textContent = nomorDO;
    bukaModal('modal-sukses-checkout');
    renderKeranjang();
  });

  // Tombol ke tracking dari modal sukses
  document.getElementById('btn-ke-tracking')?.addEventListener('click', () => {
    const do_ = document.getElementById('do-berhasil').textContent;
    window.location.href = `tracking.html?do=${do_}`;
  });

  document.getElementById('btn-salin-do')?.addEventListener('click', () => {
    const do_ = document.getElementById('do-berhasil').textContent;
    salinTeks(do_);
  });

  // Setup modals
  setupModal('modal-konfirmasi-checkout');
  setupModal('modal-sukses-checkout');

  renderKeranjang();
  setupScrollTop();
}

/* ============================================================
   MODUL 11: HALAMAN TRACKING (tracking.html)
   ============================================================ */

function initTracking() {
  if (!requireLogin()) return;
  terapkanTema();
  pastikanToastContainer();

  renderNavbar('tracking');
  tambahModalLogout();

  // Cek query string
  const params = new URLSearchParams(window.location.search);
  const doParam = params.get('do');

  const inputDO  = document.getElementById('input-nomor-do');
  const btnCari  = document.getElementById('btn-cari-do');
  const hasilEl  = document.getElementById('hasil-tracking');
  const riwayatChips = document.getElementById('riwayat-chips');

  // Riwayat pencarian
  let riwayatCari = JSON.parse(localStorage.getItem('riwayatTracking') || '[]');

  function renderChips() {
    if (!riwayatChips) return;
    riwayatChips.innerHTML = '';
    if (riwayatCari.length === 0) return;

    riwayatCari.slice(-5).reverse().forEach(no => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = no;
      chip.setAttribute('aria-label', `Lacak Nomor DO ${no}`);
      chip.addEventListener('click', () => { if (inputDO) inputDO.value = no; cariDO(no); });
      riwayatChips.appendChild(chip);
    });
  }

  function simpanRiwayat(no) {
    riwayatCari = riwayatCari.filter(r => r !== no);
    riwayatCari.push(no);
    if (riwayatCari.length > 10) riwayatCari.shift();
    localStorage.setItem('riwayatTracking', JSON.stringify(riwayatCari));
    renderChips();
  }

  function cariDO(nomorDO) {
    if (!nomorDO) {
      if (hasilEl) hasilEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Nomor DO Kosong</h3><p>Masukkan Nomor DO yang ingin dilacak.</p></div>`;
      return;
    }

    // Skeleton loading
    if (hasilEl) {
      hasilEl.innerHTML = `<div style="padding:2rem;text-align:center;">
        <div class="skeleton" style="width:60%;height:24px;margin:0 auto 1rem;"></div>
        <div class="skeleton" style="width:80%;height:16px;margin:0 auto 0.5rem;"></div>
        <div class="skeleton" style="width:70%;height:16px;margin:0 auto 0.5rem;"></div>
        <div class="skeleton" style="width:50%;height:16px;margin:0 auto;"></div>
      </div>`;
    }

    setTimeout(() => {
      // Cari di dataTracking + transaksi localStorage
      let data = dataTracking[nomorDO];

      if (!data) {
        const transaksiArr = getTransaksi();
        const tr = transaksiArr.find(t => t.nomorDO === nomorDO);
        if (tr) {
          data = {
            nomorDO: tr.nomorDO,
            nama: tr.nama,
            status: tr.status,
            ekspedisi: tr.ekspedisi,
            tanggalKirim: tr.tanggal ? tr.tanggal.split('T')[0] : '-',
            paket: tr.metodeBayar || '-',
            total: formatRupiah(tr.total),
            perjalanan: tr.perjalanan || []
          };
        }
      }

      if (!data) {
        if (hasilEl) hasilEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>Nomor DO Tidak Ditemukan</h3>
            <p>Nomor DO <strong>${nomorDO}</strong> tidak ada dalam sistem.</p>
            <p>Pastikan Nomor DO yang Anda masukkan sudah benar. Nomor DO tercantum pada konfirmasi pesanan Anda.</p>
          </div>`;
        return;
      }

      simpanRiwayat(nomorDO);
      tampilHasilTracking(data);
    }, 600);
  }

  function getStepIndex(status) {
    const steps = ['Diproses', 'Dikirim', 'Dalam Perjalanan', 'Terkirim'];
    // Mapping fleksibel
    if (status === 'Terkirim') return 4;
    if (status === 'Dalam Perjalanan') return 3;
    if (status === 'Dikirim') return 2;
    return 1;
  }

  function tampilHasilTracking(data) {
    if (!hasilEl) return;

    const stepIdx = getStepIndex(data.status);
    const steps = [
      { label: 'Diproses', icon: '📋' },
      { label: 'Dikirim', icon: '📤' },
      { label: 'Dalam Perjalanan', icon: '🚚' },
      { label: 'Terkirim', icon: '✅' }
    ];

    const stepsHtml = steps.map((s, i) => {
      const nomor = i + 1;
      let cls = '';
      if (nomor < stepIdx) cls = 'selesai';
      else if (nomor === stepIdx) cls = 'aktif';
      return `
        <div class="tracking-step">
          <div class="step-dot ${cls}">${cls === 'selesai' ? '✓' : s.icon}</div>
          <span class="step-label ${cls}">${s.label}</span>
        </div>
      `;
    }).join('');

    const progressPct = ((stepIdx - 1) / 3) * 100;

    // Status badge
    const statusMap = {
      'Diproses': 'badge-warning status-diproses',
      'Dikirim':  'badge-info status-dikirim',
      'Dalam Perjalanan': 'badge-teal status-perjalanan',
      'Terkirim': 'badge-success status-terkirim'
    };
    const statusClass = statusMap[data.status] || 'badge-muted';

    // Timeline perjalanan (urut dari terbaru)
    const perjalananUrut = [...(data.perjalanan || [])].reverse();
    const timelineHtml = perjalananUrut.length > 0 ? `
      <div class="timeline">
        ${perjalananUrut.map((p, i) => `
          <div class="timeline-item" style="animation-delay:${i * 0.1}s">
            <div class="timeline-dot"></div>
            <div class="timeline-time">🕐 ${p.waktu}</div>
            <div class="timeline-desc">${p.keterangan}</div>
          </div>
        `).join('')}
      </div>
    ` : '<p class="text-muted">Belum ada riwayat perjalanan.</p>';

    hasilEl.innerHTML = `
      <article class="card anim-fadeinup">
        <div class="card-header">
          <div class="flex-between">
            <div>
              <h2 style="font-size:1.1rem;margin-bottom:4px;">
                📦 Nomor DO: <code>${data.nomorDO}</code>
              </h2>
              <p style="margin:0;font-size:0.875rem;color:var(--text-muted);">
                a.n. ${data.nama}
              </p>
            </div>
            <div style="display:flex;gap:0.5rem;align-items:center;">
              <span class="badge ${statusClass}" style="font-size:0.875rem;padding:4px 12px;">${data.status}</span>
              <button class="btn btn-sm btn-ghost" id="btn-salin-do-tracking" aria-label="Salin Nomor DO">📋 Salin</button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- Langkah Progress -->
          <section aria-label="Status Pengiriman">
            <div class="tracking-steps">
              <div class="tracking-line" id="tracking-progress-line" style="width:0%"></div>
              ${stepsHtml}
            </div>
          </section>

          <!-- Detail -->
          <div class="grid-2" style="margin-bottom:1.5rem;">
            <div class="card" style="padding:1rem;">
              <p class="text-muted text-sm">Ekspedisi</p>
              <p class="text-bold">🚚 ${data.ekspedisi}</p>
            </div>
            <div class="card" style="padding:1rem;">
              <p class="text-muted text-sm">Tanggal Kirim</p>
              <p class="text-bold">📅 ${formatTanggal(data.tanggalKirim)}</p>
            </div>
            <div class="card" style="padding:1rem;">
              <p class="text-muted text-sm">Jenis Paket</p>
              <p class="text-bold">📦 ${data.paket}</p>
            </div>
            <div class="card" style="padding:1rem;">
              <p class="text-muted text-sm">Total Pembayaran</p>
              <p class="text-bold" style="color:var(--clr-primary-600);">💰 ${data.total}</p>
            </div>
          </div>

          <!-- Timeline -->
          <section aria-label="Riwayat Perjalanan">
            <h3 style="margin-bottom:1rem;">🗺️ Riwayat Perjalanan</h3>
            ${timelineHtml}
          </section>
        </div>
      </article>
    `;

    // Animasi progress line
    setTimeout(() => {
      const line = document.getElementById('tracking-progress-line');
      if (line) line.style.width = progressPct + '%';
    }, 100);

    // Salin DO
    document.getElementById('btn-salin-do-tracking')?.addEventListener('click', () => {
      salinTeks(data.nomorDO);
    });
  }

  // Event pencarian
  btnCari?.addEventListener('click', () => cariDO(inputDO?.value.trim()));
  inputDO?.addEventListener('keydown', (e) => { if (e.key === 'Enter') cariDO(inputDO.value.trim()); });

  // Tombol contoh DO (data-do attribute)
  document.querySelectorAll('.btn-coba-do').forEach(btn => {
    btn.addEventListener('click', () => {
      const do_ = btn.dataset.do;
      if (inputDO) inputDO.value = do_;
      cariDO(do_);
    });
  });

  // Jika ada query string
  if (doParam) {
    if (inputDO) inputDO.value = doParam;
    cariDO(doParam);
  }

  renderChips();
  setupScrollTop();
}

/* ============================================================
   MODUL 12: HALAMAN LAPORAN (laporan.html)
   ============================================================ */

function initLaporan() {
  if (!requireLogin()) return;
  terapkanTema();
  pastikanToastContainer();

  renderNavbar('laporan');
  tambahModalLogout();

  const transaksi = getTransaksi();

  // Statistik ringkasan
  const totalPesanan = transaksi.length;
  const totalBukuTerjual = transaksi.reduce((acc, t) => acc + (t.items || []).reduce((a, i) => a + i.qty, 0), 0);
  const totalPendapatan = transaksi.reduce((acc, t) => acc + (t.total || 0), 0);

  // Buku terlaris
  const bukuCounter = {};
  transaksi.forEach(t => {
    (t.items || []).forEach(item => {
      bukuCounter[item.nama] = (bukuCounter[item.nama] || 0) + item.qty;
    });
  });
  const bukuTerlaris = Object.entries(bukuCounter).sort((a, b) => b[1] - a[1])[0];

  // Update statistik
  document.getElementById('stat-total-pesanan')?.setAttribute('data-val', totalPesanan);
  document.getElementById('stat-total-pesanan') && (document.getElementById('stat-total-pesanan').textContent = totalPesanan);
  document.getElementById('stat-buku-terjual') && (document.getElementById('stat-buku-terjual').textContent = totalBukuTerjual);
  document.getElementById('stat-pendapatan')   && (document.getElementById('stat-pendapatan').textContent = formatRupiah(totalPendapatan));
  document.getElementById('stat-terlaris')     && (document.getElementById('stat-terlaris').textContent = bukuTerlaris ? `${bukuTerlaris[0]} (${bukuTerlaris[1]})` : '-');

  // Tabel rekap per buku
  const tabelRekapEl = document.querySelector('#tabel-rekap tbody');
  if (tabelRekapEl) {
    if (Object.keys(bukuCounter).length === 0) {
      tabelRekapEl.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:2rem;">Belum ada transaksi.</td></tr>`;
    } else {
      tabelRekapEl.innerHTML = ''; // hapus baris placeholder "Memuat data..."
      Object.entries(bukuCounter).sort((a, b) => b[1] - a[1]).forEach(([nama, qty], idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx + 1}</td><td>${nama}</td><td style="text-align:center;font-weight:700;">${qty}</td>`;
        tabelRekapEl.appendChild(tr);
      });
    }
  }

  // Grafik batang CSS (pakai class dari laporan.html internal CSS)
  const chartEl = document.getElementById('grafik-batang');
  if (chartEl) {
    if (Object.keys(bukuCounter).length === 0) {
      chartEl.innerHTML = `<p class="text-muted text-center" style="align-self:center;width:100%;">Tidak ada data untuk ditampilkan.</p>`;
    } else {
      const maxQty = Math.max(...Object.values(bukuCounter));
      chartEl.innerHTML = '';

      Object.entries(bukuCounter).sort((a, b) => b[1] - a[1]).slice(0, 7).forEach(([nama, qty]) => {
        const pct = maxQty > 0 ? (qty / maxQty) * 80 : 0; // maks 80% agar angka di atas bar tidak terpotong
        const item = document.createElement('div');
        item.className = 'bar-item';
        item.innerHTML = `
          <div class="bar-fill" data-value="${qty}" title="${nama}: ${qty} eksemplar" style="height:0%;max-width:48px;"></div>
          <div class="bar-label">${nama.length > 15 ? nama.substring(0, 13) + '…' : nama}</div>
        `;
        chartEl.appendChild(item);

        // Animasi bar setelah append
        setTimeout(() => {
          const barEl = item.querySelector('.bar-fill');
          if (barEl) barEl.style.height = pct + '%';
        }, 200);
      });
    }
  }

  // Empty state
  if (transaksi.length === 0) {
    const emptyEl = document.getElementById('laporan-empty');
    if (emptyEl) emptyEl.style.display = 'block';
    const kontenEl = document.getElementById('laporan-konten');
    if (kontenEl) kontenEl.style.display = 'none';
  }

  // Tombol Cetak
  document.getElementById('btn-cetak')?.addEventListener('click', () => window.print());

  setupScrollTop();
}

/* ============================================================
   MODUL 13: HALAMAN HISTORY (history.html)
   ============================================================ */

function initHistory() {
  if (!requireLogin()) return;
  terapkanTema();
  pastikanToastContainer();

  renderNavbar('history');
  tambahModalLogout();

  let cariTeks = '';
  let filterStatus = '';

  // Gabungkan riwayat localStorage + data awal dataTracking sebagai contoh
  function semuaRiwayat() {
    const lokal = getTransaksi();
    const awal = Object.values(dataTracking).map(d => ({
      nomorDO: d.nomorDO,
      tanggal: d.tanggalKirim,
      nama: d.nama,
      total: d.total,
      status: d.status,
      ekspedisi: d.ekspedisi,
      items: [],
      _dariAwal: true
    }));
    return [...awal, ...lokal];
  }

  // Simpan referensi data terakhir agar bisa diakses dari event delegation
  let dataHistoryAktif = [];

  function renderHistory() {
    let data = semuaRiwayat();

    if (cariTeks) {
      const q = cariTeks.toLowerCase();
      data = data.filter(t =>
        t.nomorDO.toLowerCase().includes(q) ||
        t.nama.toLowerCase().includes(q)
      );
    }

    if (filterStatus) {
      data = data.filter(t => t.status === filterStatus);
    }

    // Simpan referensi data aktif
    dataHistoryAktif = data;

    const tbody = document.querySelector('#tabel-history tbody');
    if (!tbody) return;

    const counterEl = document.getElementById('history-counter');
    if (counterEl) counterEl.textContent = `${data.length} transaksi`;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">
        <div class="empty-state-icon" aria-hidden="true">📋</div>
        <p>Tidak ada riwayat transaksi.</p>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    data.forEach((t, idx) => {
      const statusMap = {
        'Diproses': 'badge-warning',
        'Dikirim':  'badge-info',
        'Dalam Perjalanan': 'badge-teal',
        'Terkirim': 'badge-success'
      };
      const badgeCls = statusMap[t.status] || 'badge-muted';
      const totalStr = typeof t.total === 'number' ? formatRupiah(t.total) : t.total;

      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.dataset.idx = idx;
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><code>${t.nomorDO}</code></td>
        <td>${formatTanggalPendek(t.tanggal || t.tanggalKirim || '-')}</td>
        <td>${t.nama}</td>
        <td style="font-weight:600;color:var(--clr-primary-600)">${totalStr}</td>
        <td><span class="badge ${badgeCls}">${t.status}</span></td>
        <td>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-primary btn-lacak" data-do="${t.nomorDO}" aria-label="Lacak ${t.nomorDO}">🔍 Lacak</button>
            <button class="btn btn-sm btn-ghost btn-detail" data-idx="${idx}" aria-label="Detail ${t.nomorDO}">📄</button>
            ${!t._dariAwal ? `<button class="btn btn-sm btn-danger btn-hapus-riwayat" data-do="${t.nomorDO}" aria-label="Hapus ${t.nomorDO}">🗑️</button>` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Event delegation — dipasang SEKALI di luar renderHistory()
  const historyTbody = document.querySelector('#tabel-history tbody');
  if (historyTbody) {
    historyTbody.addEventListener('click', (e) => {
      const btnLacak  = e.target.closest('.btn-lacak');
      const btnDetail = e.target.closest('.btn-detail');
      const btnHapus  = e.target.closest('.btn-hapus-riwayat');

      if (btnLacak) {
        window.location.href = `tracking.html?do=${btnLacak.dataset.do}`;
      } else if (btnDetail) {
        const item = dataHistoryAktif[Number(btnDetail.dataset.idx)];
        if (item) tampilDetailModal(item);
      } else if (btnHapus) {
        hapusRiwayat(btnHapus.dataset.do);
      }
    });
  }

  function tampilDetailModal(t) {
    const totalStr = typeof t.total === 'number' ? formatRupiah(t.total) : t.total;
    const itemsHtml = t.items && t.items.length > 0 ?
      t.items.map(i => `<tr><td>${i.nama}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${formatRupiah(i.harga * i.qty)}</td></tr>`).join('') :
      `<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Data item tidak tersedia</td></tr>`;

    const detailEl = document.getElementById('modal-history-detail-konten');
    if (detailEl) {
      detailEl.innerHTML = `
        <div style="margin-bottom:1rem;display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div><span class="text-muted text-sm">Nomor DO</span><p class="text-bold"><code>${t.nomorDO}</code></p></div>
          <div><span class="text-muted text-sm">Status</span><p><span class="badge badge-info">${t.status}</span></p></div>
          <div><span class="text-muted text-sm">Pemesan</span><p class="text-bold">${t.nama}</p></div>
          <div><span class="text-muted text-sm">Ekspedisi</span><p>${t.ekspedisi || '-'}</p></div>
          <div><span class="text-muted text-sm">Tanggal</span><p>${formatTanggalPendek(t.tanggal || t.tanggalKirim || '-')}</p></div>
          <div><span class="text-muted text-sm">Total</span><p class="text-bold" style="color:var(--clr-primary-600)">${totalStr}</p></div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Buku</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
      `;
    }
    bukaModal('modal-history-detail');
  }

  function hapusRiwayat(nomorDO) {
    if (!confirm(`Hapus riwayat transaksi ${nomorDO}?`)) return;
    const lokal = getTransaksi().filter(t => t.nomorDO !== nomorDO);
    localStorage.setItem('transaksi', JSON.stringify(lokal));
    renderHistory();
    showToast(`Riwayat ${nomorDO} dihapus.`, 'success');
  }

  // Pencarian & Filter
  document.getElementById('input-cari-history')?.addEventListener('input', (e) => {
    cariTeks = e.target.value;
    renderHistory();
  });
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderHistory();
  });
  document.getElementById('btn-hapus-semua')?.addEventListener('click', () => {
    if (!confirm('Hapus SEMUA riwayat transaksi yang baru? (Data awal dari dosen tetap ada)')) return;
    localStorage.removeItem('transaksi');
    renderHistory();
    showToast('Semua riwayat baru dihapus.', 'success');
  });

  setupModal('modal-history-detail');
  renderHistory();
  setupScrollTop();
}

/* ============================================================
   MODUL 14: INISIALISASI HALAMAN
   Deteksi halaman via document.body.dataset.page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Terapkan tema dari localStorage sebelum render
  terapkanTema();
  pastikanToastContainer();
  setupScrollTop();

  // Tambah tombol scroll to top ke DOM jika belum ada
  if (!document.getElementById('scroll-top')) {
    const btn = document.createElement('button');
    btn.id = 'scroll-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Kembali ke atas');
    document.body.appendChild(btn);
    setupScrollTop();
  }

  const halaman = document.body.dataset.page;

  switch (halaman) {
    case 'login':
      initLogin();
      break;
    case 'dashboard':
      initDashboard();
      break;
    case 'stok':
      initStok();
      break;
    case 'checkout':
      initCheckout();
      break;
    case 'tracking':
      initTracking();
      break;
    case 'laporan':
      initLaporan();
      break;
    case 'history':
      initHistory();
      break;
    default:
      // Halaman tidak dikenal
      break;
  }
});


/* ============================================================
   MODUL 15: EXTRAS (animasi & fitur lucu)
   ============================================================ */
(function () {
  const kurangGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const halaman = () => document.body.dataset.page;

  function konfeti() {
    if (kurangGerak) return;
    const warna = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement('span');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = warna[i % warna.length];
      p.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      p.style.animationDelay = Math.random() * 0.6 + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 5500);
    }
  }

  function hujanBuku() {
    if (kurangGerak) return;
    for (let i = 0; i < 30; i++) {
      const b = document.createElement('span');
      b.className = 'book-rain';
      b.textContent = ['📚', '📖', '📕', '📗', '📘'][i % 5];
      b.style.left = Math.random() * 95 + 'vw';
      b.style.animationDuration = 2 + Math.random() * 3 + 's';
      b.style.animationDelay = Math.random() * 1.5 + 's';
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 6500);
    }
  }

  function ripple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn || kurangGerak) return;
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height);
      const s = document.createElement('span');
      s.className = 'ripple';
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      btn.appendChild(s);
      setTimeout(() => s.remove(), 600);
    });
  }

  function reveal() {
    const els = document.querySelectorAll('.nav-card, .stat-card, .laporan-stat-card, .grafik-container, .tracking-search-box');
    if (kurangGerak || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('tampil'); io.unobserve(en.target); }
    }), { threshold: 0.1 });
    els.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  function hitungNaik() {
    if (kurangGerak) return;
    ['stat-judul', 'stat-stok', 'stat-transaksi', 'stat-pendapatan', 'stat-total-pesanan', 'stat-buku-terjual'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const teks = el.textContent;
      const angka = parseInt(teks.replace(/\D/g, ''), 10);
      if (!angka) return;
      const prefix = teks.startsWith('Rp') ? 'Rp ' : '';
      const mulai = performance.now();
      (function tick(now) {
        const t = Math.min((now - mulai) / 900, 1);
        el.textContent = prefix + Math.round(angka * t).toLocaleString('id-ID');
        if (t < 1) requestAnimationFrame(tick); else el.textContent = teks;
      })(mulai);
    });
  }

  function kutipan() {
    const sasaran = document.querySelector('.hero-greeting .container');
    if (halaman() !== 'dashboard' || !sasaran) return;
    const daftar = ['Buku adalah jendela dunia.', 'Membaca hari ini, memimpin esok hari.', 'Satu halaman sehari, lama-lama jadi perpustakaan.', 'Ilmu itu seperti cahaya, makin dibagi makin terang.', 'Tidak ada buku yang membosankan, hanya belum ketemu yang cocok.', 'Hari ini baca apa? 📖', 'Investasi terbaik adalah investasi di kepalamu.'];
    const q = document.createElement('div');
    q.className = 'kutipan-hari';
    q.textContent = '💬 “' + daftar[Math.floor(Date.now() / 864e5) % daftar.length] + '”';
    sasaran.parentElement.insertAdjacentElement('afterend', q);
    q.style.margin = '1rem auto 0'; q.style.maxWidth = '1100px';
  }

  function bukuMelayang() {
    if (halaman() !== 'login' || kurangGerak) return;
    ['📚', '📖', '📕', '📗', '📘', '📙'].forEach((e, i) => {
      const b = document.createElement('span');
      b.className = 'book-float';
      b.textContent = e;
      b.style.cssText = `left:${8 + i * 16}%;font-size:${2 + (i % 3)}rem;animation-duration:${14 + i * 3}s;animation-delay:${-i * 4}s`;
      document.body.appendChild(b);
    });
  }

  function maskot() {
    const tips = {
      login: 'Halo! Coba login pakai akun Admin: admin@pustaka.com 👋',
      dashboard: 'Klik kartu menu untuk mulai menjelajah! 🚀',
      stok: 'Pakai filter jenis & pencarian buat nemu buku cepat 🔍',
      checkout: 'Isi semua data dulu ya, baru bisa pesan 🛒',
      tracking: 'Coba lacak DO 20230012 atau 20230013 📦',
      laporan: 'Klik “Cetak Laporan” buat jadi PDF 🖨️',
      history: 'Klik 📄 untuk lihat detail transaksi 📋'
    };
    const kejutan = ['Wah, kamu rajin banget klik aku! 🥰', 'Psst… coba ↑↑↓↓←→←→ B A 🎮', 'Semangat UTS-nya! 💪'];
    const box = document.createElement('div');
    box.id = 'si-pusta';
    box.innerHTML = '<div class="maskot" role="button" tabindex="0" aria-label="Si Pusta, maskot tips">📖</div><div class="bubble" role="status"></div>';
    document.body.appendChild(box);
    const m = box.querySelector('.maskot'), bub = box.querySelector('.bubble');
    let klik = 0, timer;
    function bicara(teks) {
      bub.textContent = teks; bub.classList.add('tampil');
      clearTimeout(timer); timer = setTimeout(() => bub.classList.remove('tampil'), 4000);
    }
    function aksi() {
      klik++;
      if (klik % 7 === 0) { hujanBuku(); konfeti(); bicara(kejutan[(klik / 7 - 1) % kejutan.length]); }
      else bicara(tips[halaman()] || 'Halo, aku Si Pusta! 📚');
    }
    m.addEventListener('click', aksi);
    m.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aksi(); } });
    setTimeout(() => bicara(tips[halaman()] || 'Halo, aku Si Pusta! 📚'), 1200);
  }

  function konami() {
    const kode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let i = 0;
    document.addEventListener('keydown', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = (k === kode[i]) ? i + 1 : (k === kode[0] ? 1 : 0);
      if (i === kode.length) { i = 0; hujanBuku(); if (typeof showToast === 'function') showToast('🎮 Easter egg aktif! Hujan buku!', 'success'); }
    });
  }

  function pantauCheckout() {
    const modal = document.getElementById('modal-sukses-checkout');
    if (!modal) return;
    new MutationObserver(() => { if (modal.classList.contains('aktif')) konfeti(); })
      .observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ripple(); konami(); maskot(); bukuMelayang(); pantauCheckout();
    setTimeout(() => { kutipan(); reveal(); hitungNaik(); }, 150);
  });
})();
