function cocokPencarianPesanan(pesanan, kata) {
  if (/^\d+$/.test(kata)) return pesanan.noMeja === Number(kata) || String(pesanan.id) === kata;
  return pesanan.nama.toLocaleLowerCase('id').includes(kata) || nomorPesanan(pesanan.id).toLowerCase() === kata;
}

function markupProgres(status) {
  if (status === 'Dibatalkan') return '<p class="catatan-pelanggan">Pesanan ini dibatalkan. Hubungi kasir jika ada pembayaran yang perlu dikonfirmasi.</p>';
  var urutan = STATUS_PESANAN.indexOf(status);
  return '<div class="progres" aria-label="Status saat ini: ' + aman(status) + '">' + STATUS_PESANAN.slice(0,4).map(function (tahap, index) {
    return '<div class="progres-item ' + (index <= urutan ? 'lewat' : '') + '"><span class="progres-dot">' + (index < urutan ? '✓' : index + 1) + '</span>' + tahap + '</div>';
  }).join('') + '</div>';
}

function markupKartuPesanan(pesanan) {
  var items = pesanan.items.map(function (item) { return '<li><span>' + item.jumlah + ' × ' + aman(item.nama) + '</span><strong>' + rupiah(item.harga * item.jumlah) + '</strong></li>'; }).join('');
  var bayar = '<span class="bayar">Belum dibayar · Bayar di kasir</span>';
  if (pesanan.sudahBayar) bayar = '<span class="bayar lunas">✓ Sudah dibayar di kasir</span>';
  var tombol = '';
  if (pesanan.status === 'Baru') tombol = '<button class="tombol bahaya" data-batal="' + pesanan.id + '">Batalkan Pesanan</button>';
  var catatan = '';
  if (pesanan.catatan) catatan = '<p class="catatan-pelanggan">Catatan: ' + aman(pesanan.catatan) + '</p>';
  return '<article class="panel kartu-pesanan"><div class="pesanan-kepala"><div><h2>' + nomorPesanan(pesanan.id) + '</h2><p class="kecil redup">' + waktuLokal(pesanan.waktu) + ' WITA</p></div>' + badgeStatus(pesanan.status) + '</div><div class="pesanan-identitas"><span>Atas nama <strong>' + aman(pesanan.nama) + '</strong></span><span>Meja <strong>' + pesanan.noMeja + '</strong></span></div>' + markupProgres(pesanan.status) + '<ul class="daftar-item">' + items + '</ul>' + catatan + '<div class="baris-total total"><span>Total pesanan</span><strong>' + rupiah(pesanan.total) + '</strong></div><div class="pesanan-akhir">' + bayar + tombol + '</div></article>';
}

function tampilStatusPesanan() {
  var kata = document.getElementById('cari-pesanan').value.trim().toLocaleLowerCase('id');
  var wadah = document.getElementById('daftar-status');
  if (!kata) { wadah.innerHTML = tampilKosong('Cari kabar pesananmu', 'Masukkan nama atau nomor meja yang digunakan saat memesan.', 'search'); return; } 
  var hasil = ambilData(KUNCI_PESANAN).filter(function (pesanan) { return cocokPencarianPesanan(pesanan, kata); });
  hasil.sort(function (a, b) { return new Date(b.waktu) - new Date(a.waktu); });
  var html = hasil.map(markupKartuPesanan).join('');
  if (!hasil.length) html = tampilKosong('Pesanan belum ditemukan', 'Periksa kembali nama atau nomor meja. Pesanan tersimpan di browser tempat kamu memesan.', 'bag');
  wadah.innerHTML = html; 
}

function batalkanPesanan(id) {
  var daftar = ambilData(KUNCI_PESANAN);
  var pesanan = daftar.find(function (item) { return item.id === id; });
  if (!pesanan || pesanan.status !== 'Baru') { tampilToast('Pesanan sudah diproses atau tidak ditemukan. Pembatalan tidak tersedia.', 'bahaya'); tampilStatusPesanan(); return; }
  pesanan.status = 'Dibatalkan';
  if (!simpanData(KUNCI_PESANAN, daftar)) return;
  tampilStatusPesanan();
  tampilToast('Pesanan berhasil dibatalkan.');
}

function mintaBatalPesanan(event) {
  var tombol = event.target.closest('[data-batal]');
  if (!tombol) return;
  var id = Number(tombol.dataset.batal);
  bukaKonfirmasi('Batalkan pesanan?', 'Batalkan pesanan ini? Pesanan yang dibatalkan tidak akan disiapkan.', function () { batalkanPesanan(id); }, 'Ya, batalkan');
}

function cariStatus(event) { event.preventDefault(); tampilStatusPesanan(); }

function sinkronStatus(event) { if (event.key === KUNCI_PESANAN || event.key === null) tampilStatusPesanan(); }

document.getElementById('form-cari-status').addEventListener('submit', cariStatus); 
document.getElementById('cari-pesanan').addEventListener('input', tampilStatusPesanan); 
document.getElementById('daftar-status').addEventListener('click', mintaBatalPesanan); 
window.addEventListener('storage', sinkronStatus); // [TEKNOLOGI: EVENT] Tangani interaksi storage.
document.getElementById('cari-pesanan').value = new URLSearchParams(window.location.search).get('cari') || '';
tampilStatusPesanan();
