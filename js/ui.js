var aksiKonfirmasi = null;
var saatAdminSiap = null;
var JALUR_IKON = {
  bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/>',
  arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  edit:'<path d="m14 4 6 6M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M21 11h-6v5h6"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'
};

function ikon(nama) { return '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">' + (JALUR_IKON[nama] || JALUR_IKON.bag) + '</svg>'; }

function aman(teks) {
  var pengganti = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  return String(teks).replace(/[&<>"']/g, function (huruf) { return pengganti[huruf]; });
}

function rupiah(angka) { return new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(angka); }

function waktuLokal(waktu) { return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Makassar'}).format(new Date(waktu)); }

function nomorPesanan(id) { return 'MOI-' + id; }

function badgeStatus(status) { return '<span class="badge ' + aman(status.toLowerCase()) + '">' + aman(status) + '</span>'; }

function tampilKosong(judul, deskripsi, namaIkon) { return '<div class="kosong"><div class="kosong-icon">' + ikon(namaIkon) + '</div><h3>' + aman(judul) + '</h3><p>' + aman(deskripsi) + '</p></div>'; }

function tampilToast(pesan, jenis) {
  var wadah = document.getElementById('toast-area');
  if (!wadah) return;
  var toast = document.createElement('div');
  toast.className = 'toast ' + (jenis || 'sukses');
  toast.textContent = pesan; 
  if (jenis === 'bahaya') toast.setAttribute('role', 'alert'); 
  wadah.appendChild(toast);
 
  setTimeout(function () { toast.remove(); }, 3000);
}

function bukaKonfirmasi(judul, pesan, aksi, label) {
  aksiKonfirmasi = aksi;
  document.getElementById('judul-konfirmasi').textContent = judul; 
  document.getElementById('teks-konfirmasi').textContent = pesan; 
  document.getElementById('setuju-konfirmasi').textContent = label || 'Ya, lanjutkan'; 
  document.getElementById('modal-konfirmasi').showModal(); 
  document.getElementById('batal-konfirmasi').focus();
}

function setujuiKonfirmasi() {
  var aksi = aksiKonfirmasi;
  aksiKonfirmasi = null;
  document.getElementById('modal-konfirmasi').close(); 
  if (aksi) aksi();
}

function batalKonfirmasi() { aksiKonfirmasi = null; document.getElementById('modal-konfirmasi').close(); }

function kartuMenu(menu, beranda) {
  var tombol = '<button class="tombol lembut" data-tambah="' + menu.id + '" aria-label="Tambah ' + aman(menu.nama) + '" ' + (menu.tersedia ? '' : 'disabled') + '>+ Tambah</button>';
  if (beranda) tombol = '<a class="tombol lembut" href="pesan.html">Pesan ' + ikon('arrow') + '</a>';
  var label = menu.kategori;
  if (!menu.tersedia) label = 'Sedang habis';
  return '<article class="kartu-menu ' + (menu.tersedia ? '' : 'habis') + '"><div class="menu-gambar ' + aman(menu.kategori.toLowerCase()) + '"><span class="tag-menu">' + aman(label) + '</span><span class="menu-emoji" aria-hidden="true">' + aman(menu.emoji) + '</span></div><div class="kartu-isi"><h3>' + aman(menu.nama) + '</h3><p>' + aman(menu.deskripsi) + '</p><div class="menu-bawah"><strong class="harga">' + rupiah(menu.harga) + '</strong>' + tombol + '</div></div></article>';
}

function pasangAdmin(callback) {
  saatAdminSiap = callback;
  perbaruiAksesAdmin();
  document.getElementById('form-login').addEventListener('submit', masukAdmin); 
  document.getElementById('pin').addEventListener('input', periksaPINLangsung); 
  document.getElementById('keluar-admin').addEventListener('click', keluarAdmin); 
}

function perbaruiAksesAdmin() {
  if (!document.getElementById('login-admin')) return;
  var aktif = adminAktif();
  document.getElementById('login-admin').hidden = aktif; 
  document.getElementById('konten-admin').hidden = !aktif; 
  if (!aktif) document.querySelectorAll('dialog[open]').forEach(function (modal) { modal.close(); }); 
  if (aktif && saatAdminSiap) saatAdminSiap();
}

function masukAdmin(event) {
  event.preventDefault();
  var error = validasiPIN(document.getElementById('pin').value);
  tampilError('pin', error);
  if (error) { laporValidasiGagal(event.target); return; }
  try {
    localStorage.setItem(KUNCI_ADMIN, 'true'); 
    event.target.reset();
    perbaruiAksesAdmin();
    tampilToast('Selamat datang, tim Moi.');
  } catch (gagal) { tampilToast('Login gagal disimpan. Periksa izin penyimpanan browser.', 'bahaya'); }
}

function periksaPINLangsung(event) { if (event.target.getAttribute('aria-invalid') === 'true') tampilError('pin', validasiPIN(event.target.value)); }

function keluarAdmin(event) {
  event.preventDefault();
  try {
    localStorage.removeItem(KUNCI_ADMIN); 
    window.location.href = 'index.html';
  } catch (error) { tampilToast('Tidak dapat menghapus status login.', 'bahaya'); }
}

function toggleNavigasi() {
  var terbuka = document.getElementById('navigasi').classList.toggle('terbuka'); 
  document.getElementById('buka-navigasi').setAttribute('aria-expanded', String(terbuka)); 
}

function tutupModalDariTombol(event) {
  var tombol = event.target.closest('[data-tutup]');
  if (tombol) document.getElementById(tombol.dataset.tutup).close(); 
}

function sinkronLogin(event) { if (event.key === KUNCI_ADMIN || event.key === null) perbaruiAksesAdmin(); }

document.getElementById('buka-navigasi').addEventListener('click', toggleNavigasi); 
document.getElementById('setuju-konfirmasi').addEventListener('click', setujuiKonfirmasi); 
document.getElementById('batal-konfirmasi').addEventListener('click', batalKonfirmasi); 
document.getElementById('modal-konfirmasi').addEventListener('cancel', batalKonfirmasi); 
document.addEventListener('click', tutupModalDariTombol); 
window.addEventListener('storage', sinkronLogin); 
if (masalahPenyimpanan) tampilToast(masalahPenyimpanan, 'bahaya');
