var idMenuEdit = null;

function hasilFilterMenu() {
  var kata = document.getElementById('cari-admin-menu').value.trim().toLocaleLowerCase('id');
  var kategori = document.getElementById('filter-kategori').value;
  var tersedia = document.getElementById('filter-tersedia').value;
  return ambilData(KUNCI_MENU).filter(function (menu) {
    return menu.nama.toLocaleLowerCase('id').includes(kata) && (kategori === 'Semua' || menu.kategori === kategori) && (tersedia === 'Semua' || String(menu.tersedia) === tersedia);
  });
}

function barisMenuAdmin(menu) {
  var tersedia = menu.tersedia ? 'Tersedia' : 'Habis';
  return '<tr><td><div class="nama-menu-sel"><span aria-hidden="true">' + aman(menu.emoji) + '</span><div><strong>' + aman(menu.nama) + '</strong><small>' + aman(menu.deskripsi) + '</small></div></div></td><td>' + aman(menu.kategori) + '</td><td><strong>' + rupiah(menu.harga) + '</strong></td><td><button class="toggle ' + (menu.tersedia ? '' : 'off') + '" data-stok="' + menu.id + '" role="switch" aria-checked="' + menu.tersedia + '" aria-label="Ketersediaan ' + aman(menu.nama) + '"><i aria-hidden="true"></i>' + tersedia + '</button></td><td><div class="aksi"><button class="tombol sekunder" data-edit-menu="' + menu.id + '" aria-label="Edit ' + aman(menu.nama) + '">' + ikon('edit') + '</button><button class="tombol bahaya" data-hapus-menu="' + menu.id + '" aria-label="Hapus ' + aman(menu.nama) + '">' + ikon('trash') + '</button></div></td></tr>';
}

function tampilMenuAdmin() {
  if (!adminAktif()) return;
  var hasil = hasilFilterMenu();
  var html = hasil.map(barisMenuAdmin).join('');
  if (!hasil.length) html = '<tr><td colspan="5">' + tampilKosong('Menu belum ditemukan', 'Ubah filter atau tambahkan menu baru.', 'search') + '</td></tr>';
  document.getElementById('tabel-menu').innerHTML = html; 
  document.getElementById('jumlah-admin-menu').textContent = 'Menampilkan ' + hasil.length + ' dari ' + ambilData(KUNCI_MENU).length + ' menu'; 
}

function bukaFormMenu(id) {
  if (!wajibAdmin()) return;
  idMenuEdit = id;
  document.getElementById('form-menu').reset(); 
  ['nama','kategori','harga','deskripsi'].forEach(function (field) { tampilError('menu-' + field, ''); });
  document.getElementById('judul-modal-menu').textContent = id ? 'Edit Menu' : 'Tambah Menu'; 
  if (id) {
    var menu = ambilData(KUNCI_MENU).find(function (item) { return item.id === id; });
    if (!menu) { tampilToast('Menu tidak ditemukan.', 'bahaya'); return; }
    ['nama','kategori','harga','deskripsi','emoji'].forEach(function (field) { document.getElementById('menu-' + field).value = menu[field]; }); 
    document.getElementById('menu-tersedia').checked = menu.tersedia;
  }
  document.getElementById('modal-menu').showModal(); 
}

function bacaFormMenu() {
  return {nama:document.getElementById('menu-nama').value.trim(),kategori:document.getElementById('menu-kategori').value,harga:Number(document.getElementById('menu-harga').value),deskripsi:document.getElementById('menu-deskripsi').value.trim(),emoji:document.getElementById('menu-emoji').value.trim() || '🍽️',tersedia:document.getElementById('menu-tersedia').checked};
}

function periksaFormMenu(menu) {
  var error = validasiMenu(menu, ambilData(KUNCI_MENU), idMenuEdit);
  Object.keys(error).forEach(function (field) { tampilError('menu-' + field, error[field]); });
  return !adaError(error);
}

function simpanMenuAdmin(event) {
  event.preventDefault();
  if (!wajibAdmin()) return;
  var menu = bacaFormMenu();
  if (!periksaFormMenu(menu)) { laporValidasiGagal(event.target); return; }
  var daftar = ambilData(KUNCI_MENU);
  menu.id = idMenuEdit || buatId(daftar);
  var posisi = daftar.findIndex(function (item) { return item.id === idMenuEdit; }); 
  if (idMenuEdit && posisi < 0) { tampilToast('Menu sudah dihapus di tab lain.', 'bahaya'); return; }
  if (idMenuEdit) daftar[posisi] = menu;
  else daftar.push(menu);
  if (!simpanData(KUNCI_MENU, daftar)) return;
  document.getElementById('modal-menu').close(); 
  tampilMenuAdmin();
  tampilToast(idMenuEdit ? 'Menu berhasil diperbarui.' : 'Menu berhasil ditambahkan.');
}

function koreksiMenu(event) {
  if (event.target.getAttribute('aria-invalid') !== 'true') return;
  var error = validasiMenu(bacaFormMenu(), ambilData(KUNCI_MENU), idMenuEdit);
  var field = event.target.id.replace('menu-', '');
  tampilError(event.target.id, error[field] || '');
}

function toggleStok(id) {
  if (!wajibAdmin()) return;
  var daftar = ambilData(KUNCI_MENU);
  var menu = daftar.find(function (item) { return item.id === id; });
  if (!menu) return;
  menu.tersedia = !menu.tersedia;
  if (!simpanData(KUNCI_MENU, daftar)) return;
  tampilMenuAdmin();
  tampilToast(menu.nama + (menu.tersedia ? ' tersedia kembali.' : ' ditandai habis.'));
}

function hapusMenuAdmin(id) {
  if (!wajibAdmin()) return;
  var daftar = ambilData(KUNCI_MENU).filter(function (item) { return item.id !== id; });
  if (!simpanData(KUNCI_MENU, daftar)) return;
  tampilMenuAdmin();
  tampilToast('Menu berhasil dihapus.');
}

function klikAksiMenu(event) {
  var tombol = event.target.closest('button');
  if (!tombol) return;
  if (tombol.dataset.editMenu) bukaFormMenu(Number(tombol.dataset.editMenu));
  if (tombol.dataset.stok) toggleStok(Number(tombol.dataset.stok));
  if (tombol.dataset.hapusMenu) {
    var id = Number(tombol.dataset.hapusMenu);
    bukaKonfirmasi('Hapus menu ini?', 'Yakin ingin menghapus? Tindakan ini tidak dapat dibatalkan. Riwayat pesanan sebelumnya tetap tersimpan.', function () { hapusMenuAdmin(id); }, 'Ya, hapus menu');
  }
}

function exportMenu() {
  var baris = [['ID','Nama','Kategori','Harga','Tersedia']];
  hasilFilterMenu().forEach(function (menu) { baris.push([menu.id,menu.nama,menu.kategori,menu.harga,menu.tersedia ? 'Ya' : 'Tidak']); });
  unduhCSV('menu-kedai-moi-' + tanggalBerkas() + '.csv', baris);
}

function tambahMenuBaru() { bukaFormMenu(null); }


function sinkronMenuAdmin(event) { if (event.key === KUNCI_MENU || event.key === null) tampilMenuAdmin(); }

document.getElementById('cari-admin-menu').addEventListener('input', tampilMenuAdmin); 
document.getElementById('filter-kategori').addEventListener('change', tampilMenuAdmin); 
document.getElementById('filter-tersedia').addEventListener('change', tampilMenuAdmin); 
document.getElementById('tambah-menu').addEventListener('click', tambahMenuBaru); 
document.getElementById('tabel-menu').addEventListener('click', klikAksiMenu); 
document.getElementById('form-menu').addEventListener('submit', simpanMenuAdmin); 
document.getElementById('form-menu').addEventListener('input', koreksiMenu); 
document.getElementById('form-menu').addEventListener('change', koreksiMenu); 
document.getElementById('export-menu').addEventListener('click', exportMenu); 
window.addEventListener('storage', sinkronMenuAdmin); 
pasangAdmin(tampilMenuAdmin);
