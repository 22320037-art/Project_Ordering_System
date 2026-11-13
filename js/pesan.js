var keranjang = [];
var kategoriAktif = 'Semua';

function tampilMenuPelanggan() {
  var kata = document.getElementById('cari-menu').value.toLocaleLowerCase('id').trim();
  var hasil = ambilData(KUNCI_MENU).filter(function (menu) {
    return menu.nama.toLocaleLowerCase('id').includes(kata) && (kategoriAktif === 'Semua' || menu.kategori === kategoriAktif);
  });
  var html = hasil.map(function (menu) { return kartuMenu(menu, false); }).join('');
  if (!hasil.length) html = tampilKosong('Menu belum ditemukan', 'Coba kata kunci atau kategori yang lain.', 'search');
  document.getElementById('grid-menu').innerHTML = html; 
  document.getElementById('jumlah-menu').textContent = hasil.length + ' menu untuk menemani harimu'; 
}


function pilihKategori(event) {
  var tombol = event.target.closest('[data-kategori]');
  if (!tombol) return;
  kategoriAktif = tombol.dataset.kategori;
  document.querySelectorAll('[data-kategori]').forEach(function (item) {
    var aktif = item.dataset.kategori === kategoriAktif;
    item.classList.toggle('aktif', aktif); 
    item.setAttribute('aria-pressed', String(aktif)); 
  });
  tampilMenuPelanggan();
}

function tambahKeKeranjang(id) {
  var menu = ambilData(KUNCI_MENU).find(function (item) { return item.id === id; });
  if (!menu || !menu.tersedia) { tampilToast('Menu ini sedang tidak tersedia.', 'bahaya'); tampilMenuPelanggan(); return; }
  var item = keranjang.find(function (baris) { return baris.idMenu === id; });
  if (item) item.jumlah += 1;
  else keranjang.push({idMenu:menu.id,nama:menu.nama,harga:menu.harga,jumlah:1,emoji:menu.emoji}); 
  tampilKeranjang();
  tampilError('keranjang', '');
  tampilToast(menu.nama + ' ditambahkan.');
}

function klikMenu(event) { var tombol = event.target.closest('[data-tambah]'); if (tombol) tambahKeKeranjang(Number(tombol.dataset.tambah)); }

function markupItemKeranjang(item) {
  return '<div class="keranjang-item"><div class="item-atas"><span class="item-emoji" aria-hidden="true">' + aman(item.emoji) + '</span><div class="item-nama"><strong>' + aman(item.nama) + '</strong><small>' + rupiah(item.harga) + '</small></div><button class="hapus-item" data-hapus="' + item.idMenu + '" aria-label="Hapus ' + aman(item.nama) + '">' + ikon('trash') + '</button></div><div class="item-bawah"><div class="kuantitas"><button data-kurang="' + item.idMenu + '" aria-label="Kurangi ' + aman(item.nama) + '" ' + (item.jumlah <= 1 ? 'disabled' : '') + '>−</button><span>' + item.jumlah + '</span><button data-tambah-jumlah="' + item.idMenu + '" aria-label="Tambah jumlah ' + aman(item.nama) + '">+</button></div><strong>' + rupiah(item.harga * item.jumlah) + '</strong></div></div>';
}

function tampilKeranjang() {
  var html = keranjang.map(markupItemKeranjang).join('');
  if (!keranjang.length) html = tampilKosong('Masih kosong, nih.', 'Tambahkan menu yang kamu suka. Yang enak-enak menunggu!', 'bag');
  document.getElementById('isi-keranjang').innerHTML = html;
  var jumlah = keranjang.reduce(function (total, item) { return total + item.jumlah; }, 0);
  var total = rupiah(hitungTotal(keranjang));
  ['jumlah-keranjang','mobile-jumlah'].forEach(function (id) { document.getElementById(id).textContent = jumlah; }); 
  ['subtotal','total','mobile-total'].forEach(function (id) { document.getElementById(id).textContent = total; }); 
}

function ubahKeranjang(event) {
  var tombol = event.target.closest('button');
  if (!tombol) return;
  var id = Number(tombol.dataset.hapus || tombol.dataset.kurang || tombol.dataset.tambahJumlah);
  var item = keranjang.find(function (baris) { return baris.idMenu === id; });
  if (!item) return;
  if (tombol.dataset.hapus) keranjang = keranjang.filter(function (baris) { return baris.idMenu !== id; });
  if (tombol.dataset.kurang && item.jumlah > 1) item.jumlah -= 1;
  if (tombol.dataset.tambahJumlah) item.jumlah += 1;
  tampilKeranjang();
}

function periksaFormPesan() {
  var error = validasiPelanggan(document.getElementById('nama').value, document.getElementById('no-meja').value);
  error.items = validasiItems(keranjang);
  error.catatan = validasiCatatan(document.getElementById('catatan').value);
  tampilError('nama', error.nama);
  tampilError('no-meja', error.meja);
  tampilError('keranjang', error.items);
  tampilError('catatan', error.catatan);
  return !adaError(error);
}

function perbaruiErrorIdentitas(event) {
  if (event.target.getAttribute('aria-invalid') !== 'true') return;
  var error = validasiPelanggan(document.getElementById('nama').value, document.getElementById('no-meja').value);
  if (event.target.id === 'nama') tampilError('nama', error.nama);
  if (event.target.id === 'no-meja') tampilError('no-meja', error.meja);
}

function perbaruiCatatan(event) {
  document.getElementById('hitung-catatan').textContent = event.target.value.length + '/100 karakter'; 
  tampilError('catatan', validasiCatatan(event.target.value));
}

function cocokkanKeranjang() {
  var daftar = ambilData(KUNCI_MENU);
  var berubah = false;
  keranjang = keranjang.filter(function (item) {
    var menu = daftar.find(function (baris) { return baris.id === item.idMenu; });
    if (!menu || !menu.tersedia) { berubah = true; return false; }
    if (item.harga !== menu.harga || item.nama !== menu.nama) berubah = true;
    item.harga = menu.harga; item.nama = menu.nama; item.emoji = menu.emoji;
    return true;
  });
  if (berubah) { tampilKeranjang(); tampilToast('Menu atau harga berubah. Periksa kembali keranjang sebelum mengirim.', 'info'); }
  return !berubah;
}

function mintaKirimPesanan(event) {
  event.preventDefault();
  if (!periksaFormPesan()) { laporValidasiGagal(document.getElementById('utama')); return; }
  if (!cocokkanKeranjang()) return;
  var nama = document.getElementById('nama').value.trim();
  var meja = document.getElementById('no-meja').value;
  bukaKonfirmasi('Pesanan sudah pas?', 'Kirim pesanan atas nama ' + nama + ' (Meja ' + meja + ')?\nTotal ' + rupiah(hitungTotal(keranjang)) + '. Pembayaran dilakukan langsung di kasir.', simpanPesananBaru, 'Ya, kirim pesanan');
}

function simpanPesananBaru() {
  if (!periksaFormPesan() || !cocokkanKeranjang()) return;
  var daftar = ambilData(KUNCI_PESANAN);
  var items = keranjang.map(function (item) { return {idMenu:item.idMenu,nama:item.nama,harga:item.harga,jumlah:item.jumlah}; });
  var pesanan = {id:buatId(daftar),nama:document.getElementById('nama').value.trim(),noMeja:Number(document.getElementById('no-meja').value),items:items,catatan:document.getElementById('catatan').value.trim(),total:hitungTotal(items),status:'Baru',sudahBayar:false,waktu:new Date().toISOString()};
  daftar.push(pesanan);
  if (!simpanData(KUNCI_PESANAN, daftar)) return;
  keranjang = [];
  document.getElementById('catatan').value = ''; 
  document.getElementById('hitung-catatan').textContent = '0/100 karakter'; 
  tampilKeranjang();
  tampilSuksesPesanan(pesanan);
}

function tampilSuksesPesanan(pesanan) {
  var panel = document.getElementById('pesan-sukses');
  panel.innerHTML = '<h2>Pesanan terkirim! 🎉</h2><p>Nomor pesanan <strong>' + nomorPesanan(pesanan.id) + '</strong> · Meja ' + pesanan.noMeja + '</p><p class="kecil">Silakan lakukan pembayaran ' + rupiah(pesanan.total) + ' langsung di kasir.</p><a class="tombol" href="status.html?cari=' + encodeURIComponent(nomorPesanan(pesanan.id)) + '">Lihat Status Pesanan ' + ikon('arrow') + '</a>';
  panel.hidden = false;
  panel.scrollIntoView({behavior:'smooth',block:'start'});
  tampilToast('Pesanan terkirim!');
}

function sinkronMenuPelanggan(event) { if (event.key === KUNCI_MENU || event.key === null) { tampilMenuPelanggan(); cocokkanKeranjang(); } }

document.getElementById('grid-menu').addEventListener('click', klikMenu); 
document.querySelector('.filter-kategori').addEventListener('click', pilihKategori); 
document.getElementById('cari-menu').addEventListener('input', tampilMenuPelanggan); 
document.getElementById('isi-keranjang').addEventListener('click', ubahKeranjang); 
document.getElementById('kirim-pesanan').addEventListener('click', mintaKirimPesanan); 
document.getElementById('form-pelanggan').addEventListener('submit', mintaKirimPesanan); 
document.getElementById('form-pelanggan').addEventListener('input', perbaruiErrorIdentitas); 
document.getElementById('catatan').addEventListener('input', perbaruiCatatan); 
window.addEventListener('storage', sinkronMenuPelanggan);
tampilMenuPelanggan();
tampilKeranjang();
