function validasiPelanggan(nama, meja) {
  var error = {nama:'', meja:''};
  var huruf = nama.trim().replace(/\s/g, '');
  if (huruf.length < 3 || !/^[\p{L} ]+$/u.test(nama.trim())) error.nama = 'Nama minimal 3 huruf dan tanpa angka.';
  if (!String(meja).trim() || !Number.isInteger(Number(meja)) || Number(meja) < 1 || Number(meja) > 50) error.meja = 'Nomor meja harus angka 1 sampai 50.';
  return error;
}

function validasiMenu(menu, daftar, idEdit) {
  var error = {nama:'', kategori:'', harga:'', deskripsi:''};
  if (menu.nama.trim().length < 3) error.nama = 'Nama menu minimal 3 karakter.';
  var duplikat = daftar.find(function (item) { return item.id !== idEdit && normalisasiNama(item.nama) === normalisasiNama(menu.nama); });
  if (duplikat) error.nama = 'Nama menu sudah ada.';
  if (!KATEGORI_MENU.includes(menu.kategori)) error.kategori = 'Pilih kategori.';
  if (!Number.isFinite(menu.harga) || menu.harga <= 0) error.harga = 'Harga harus lebih dari 0.';
  if (menu.deskripsi.length > 80) error.deskripsi = 'Deskripsi terlalu panjang.';
  return error;
}

function normalisasiNama(nama) { return nama.trim().replace(/\s+/g, ' ').toLocaleLowerCase('id'); }

function validasiCatatan(catatan) { if (catatan.length > 100) return 'Catatan maksimal 100 karakter.'; return ''; }

function validasiItems(items) {
  if (items.length === 0) return 'Keranjang masih kosong.';
  var salah = items.find(function (item) { return !Number.isInteger(item.jumlah) || item.jumlah < 1 || !Number.isFinite(item.harga * item.jumlah); });
  if (salah) return 'Jumlah setiap item minimal 1 dan harus bilangan bulat.';
  return '';
}

function validasiPIN(pin) { if (!/^\d{4}$/.test(pin) || pin !== PIN_ADMIN) return 'PIN salah.'; return ''; }

function tampilError(id, pesan) {
  var field = document.getElementById(id);
  var label = document.getElementById('error-' + id);
  if (label) label.textContent = pesan; 
  if (field) field.setAttribute('aria-invalid', String(Boolean(pesan))); 
}

function adaError(error) { return Object.values(error).some(function (pesan) { return Boolean(pesan); }); }

function laporValidasiGagal(wadah) {
  tampilToast('Periksa kembali isian Anda.', 'bahaya');
  var field = wadah.querySelector('[aria-invalid="true"]');
  if (field) field.focus();
}
