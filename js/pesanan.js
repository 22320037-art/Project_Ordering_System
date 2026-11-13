var idPesananEdit = null;
var draftItems = [];
function cocokCariAdmin(pesanan, kata) {
  if (!kata) return true;
  if (/^\d+$/.test(kata)) return pesanan.noMeja === Number(kata) || String(pesanan.id) === kata;
  return pesanan.nama.toLocaleLowerCase('id').includes(kata) || nomorPesanan(pesanan.id).toLowerCase() === kata;
}

function hasilFilterPesanan() {
  var kata = document.getElementById('cari-admin-pesanan').value.trim().toLocaleLowerCase('id');
  var status = document.getElementById('filter-status').value;
  var hasil = ambilData(KUNCI_PESANAN).filter(function (pesanan) { return cocokCariAdmin(pesanan, kata) && (status === 'Semua' || pesanan.status === status); });
  return hasil.sort(function (a,b) { return new Date(b.waktu) - new Date(a.waktu); });
}

function opsiStatus(pesanan) {
  var opsi = statusBerikutnya(pesanan.status);
  return '<select data-status="' + pesanan.id + '" aria-label="Status ' + nomorPesanan(pesanan.id) + '" ' + (opsi.length === 1 ? 'disabled' : '') + '>' + opsi.map(function (status) { return '<option ' + (pesanan.status === status ? 'selected' : '') + '>' + status + '</option>'; }).join('') + '</select>';
}
function barisPesananAdmin(pesanan) {
  var items = pesanan.items.map(function (item) { return item.jumlah + '× ' + aman(item.nama); }).join('<br>');
  var catatan = pesanan.catatan ? '<small>Catatan: ' + aman(pesanan.catatan) + '</small>' : '';
  return '<tr><td><strong>' + nomorPesanan(pesanan.id) + '</strong><small>' + waktuLokal(pesanan.waktu) + ' WITA</small></td><td><strong>' + aman(pesanan.nama) + '</strong></td><td>' + pesanan.noMeja + '</td><td class="item-sel">' + items + catatan + '</td><td><strong>' + rupiah(pesanan.total) + '</strong></td><td>' + badgeStatus(pesanan.status) + '<div style="margin-top:7px">' + opsiStatus(pesanan) + '</div></td><td><label class="cek"><input type="checkbox" data-bayar="' + pesanan.id + '" ' + (pesanan.sudahBayar ? 'checked' : '') + '> Sudah Dibayar</label></td><td><div class="aksi"><button class="tombol sekunder" data-edit-pesanan="' + pesanan.id + '" aria-label="Edit ' + nomorPesanan(pesanan.id) + '">' + ikon('edit') + '</button><button class="tombol bahaya" data-hapus-pesanan="' + pesanan.id + '" aria-label="Hapus ' + nomorPesanan(pesanan.id) + '">' + ikon('trash') + '</button></div></td></tr>';
}
function tampilPesananAdmin() {
  if (!adminAktif()) return;
  var hasil = hasilFilterPesanan();
  var html = hasil.map(barisPesananAdmin).join('');
  if (!hasil.length) html = '<tr><td colspan="8">' + tampilKosong('Belum ada pesanan', 'Pesanan pelanggan akan muncul di sini. Coba periksa filter pencarian.', 'bag') + '</td></tr>';
  document.getElementById('tabel-pesanan').innerHTML = html; 
  document.getElementById('jumlah-admin-pesanan').textContent = 'Menampilkan ' + hasil.length + ' dari ' + ambilData(KUNCI_PESANAN).length + ' pesanan'; 
}
function ubahStatusPesanan(id, status) {
  if (!wajibAdmin()) return;
  var daftar = ambilData(KUNCI_PESANAN);
  var pesanan = daftar.find(function (item) { return item.id === id; });
  if (!pesanan || !statusBerikutnya(pesanan.status).includes(status)) { tampilToast('Status sudah berubah. Periksa pesanan kembali.', 'bahaya'); tampilPesananAdmin(); return; }
  pesanan.status = status;
  if (!simpanData(KUNCI_PESANAN, daftar)) { tampilPesananAdmin(); return; }
  tampilPesananAdmin();
  tampilToast('Status pesanan diubah menjadi ' + status + '.');
}
function ubahPembayaran(id, sudahBayar) {
  if (!wajibAdmin()) return;
  var daftar = ambilData(KUNCI_PESANAN);
  var pesanan = daftar.find(function (item) { return item.id === id; });
  if (!pesanan) { tampilPesananAdmin(); return; }
  pesanan.sudahBayar = sudahBayar;
  if (!simpanData(KUNCI_PESANAN, daftar)) { tampilPesananAdmin(); return; }
  tampilPesananAdmin();
  tampilToast(sudahBayar ? 'Pembayaran di kasir telah dicatat.' : 'Tanda pembayaran telah dihapus.');
}
function perubahanPesanan(event) {
  var target = event.target;
  if (target.dataset.bayar) ubahPembayaran(Number(target.dataset.bayar), target.checked);
  if (!target.dataset.status) return;
  var id = Number(target.dataset.status);
  if (target.value === 'Dibatalkan') { 
    tampilPesananAdmin();
    bukaKonfirmasi('Batalkan pesanan?', 'Batalkan pesanan ini? Hanya pesanan berstatus Baru yang dapat dibatalkan.', function () { ubahStatusPesanan(id, 'Dibatalkan'); }, 'Ya, batalkan');
  } else ubahStatusPesanan(id, target.value);
}
function bukaEditPesanan(id) {
  if (!wajibAdmin()) return;
  var pesanan = ambilData(KUNCI_PESANAN).find(function (item) { return item.id === id; });
  if (!pesanan) { tampilToast('Pesanan tidak ditemukan.', 'bahaya'); return; }
  idPesananEdit = id;
  draftItems = JSON.parse(JSON.stringify(pesanan.items)); 
  document.getElementById('edit-nama').value = pesanan.nama; 
  document.getElementById('edit-meja').value = pesanan.noMeja; 
  document.getElementById('edit-catatan').value = pesanan.catatan; 
  ['edit-nama','edit-meja','edit-catatan','edit-items'].forEach(function (field) { tampilError(field, ''); });
  tampilOpsiMenuEdit();
  tampilDraftItems();
  document.getElementById('modal-pesanan').showModal();
}
function tampilOpsiMenuEdit() {
  var tersedia = ambilData(KUNCI_MENU).filter(function (menu) { return menu.tersedia; });
  var html = '<option value="">Pilih menu tambahan</option>' + tersedia.map(function (menu) { return '<option value="' + menu.id + '">' + aman(menu.nama) + ' · ' + rupiah(menu.harga) + '</option>'; }).join('');
  document.getElementById('edit-pilih-menu').innerHTML = html; 
}
function markupDraftItem(item, index) {
  return '<div class="edit-item"><div><strong>' + aman(item.nama) + '</strong><div class="kecil redup">' + rupiah(item.harga) + '</div></div><input type="number" min="1" step="1" value="' + item.jumlah + '" data-jumlah-edit="' + index + '" aria-label="Jumlah ' + aman(item.nama) + '" aria-describedby="error-edit-items"><button type="button" class="tombol bahaya ikon-saja" data-hapus-edit="' + index + '" aria-label="Hapus item ' + aman(item.nama) + '">' + ikon('trash') + '</button></div>';
}
function tampilDraftItems() {
  document.getElementById('edit-items').innerHTML = draftItems.map(markupDraftItem).join(''); 
  document.getElementById('edit-total').textContent = rupiah(hitungTotal(draftItems)); 
}
function tambahItemEdit() {
  var id = Number(document.getElementById('edit-pilih-menu').value);
  var menu = ambilData(KUNCI_MENU).find(function (item) { return item.id === id && item.tersedia; });
  if (!menu) { tampilToast('Pilih menu yang tersedia terlebih dahulu.', 'bahaya'); return; }
  var item = draftItems.find(function (baris) { return baris.idMenu === id; });
  if (item) item.jumlah += 1;
  else draftItems.push({idMenu:menu.id,nama:menu.nama,harga:menu.harga,jumlah:1});
  tampilDraftItems();
  tampilError('edit-items', validasiItems(draftItems));
}
function ubahJumlahEdit(event) {
  if (!event.target.hasAttribute('data-jumlah-edit')) return;
  var index = Number(event.target.dataset.jumlahEdit);
  draftItems[index].jumlah = Number(event.target.value);
  event.target.setAttribute('aria-invalid', String(!Number.isInteger(draftItems[index].jumlah) || draftItems[index].jumlah < 1)); 
  tampilError('edit-items', validasiItems(draftItems));
  document.getElementById('edit-total').textContent = rupiah(hitungTotal(draftItems)); 
}
function hapusItemEdit(event) {
  var tombol = event.target.closest('[data-hapus-edit]');
  if (!tombol) return;
  draftItems.splice(Number(tombol.dataset.hapusEdit), 1);
  tampilDraftItems();
  tampilError('edit-items', validasiItems(draftItems));
}
function periksaEditPesanan() {
  var error = validasiPelanggan(document.getElementById('edit-nama').value, document.getElementById('edit-meja').value);
  error.items = validasiItems(draftItems);
  error.catatan = validasiCatatan(document.getElementById('edit-catatan').value);
  tampilError('edit-nama', error.nama);
  tampilError('edit-meja', error.meja);
  tampilError('edit-items', error.items);
  tampilError('edit-catatan', error.catatan);
  return !adaError(error);
}
function simpanEditPesanan(event) {
  event.preventDefault();
  if (!wajibAdmin()) return;
  if (!periksaEditPesanan()) { laporValidasiGagal(event.target); return; }
  var daftar = ambilData(KUNCI_PESANAN);
  var pesanan = daftar.find(function (item) { return item.id === idPesananEdit; });
  if (!pesanan) { tampilToast('Pesanan sudah dihapus di tab lain.', 'bahaya'); return; }
  pesanan.nama = document.getElementById('edit-nama').value.trim();
  pesanan.noMeja = Number(document.getElementById('edit-meja').value);
  pesanan.catatan = document.getElementById('edit-catatan').value.trim();
  pesanan.items = JSON.parse(JSON.stringify(draftItems));
  pesanan.total = hitungTotal(pesanan.items);
  if (!simpanData(KUNCI_PESANAN, daftar)) return;
  document.getElementById('modal-pesanan').close(); 
  tampilPesananAdmin();
  tampilToast('Pesanan berhasil diperbarui.');
}
function koreksiEditPesanan(event) { if (event.target.getAttribute('aria-invalid') === 'true' && !event.target.hasAttribute('data-jumlah-edit')) periksaEditPesanan(); }
function hapusPesananAdmin(id) {
  if (!wajibAdmin()) return;
  var daftar = ambilData(KUNCI_PESANAN).filter(function (item) { return item.id !== id; });
  if (!simpanData(KUNCI_PESANAN, daftar)) return;
  tampilPesananAdmin();
  tampilToast('Pesanan berhasil dihapus.');
}
function klikAksiPesanan(event) {
  var tombol = event.target.closest('button');
  if (!tombol) return;
  if (tombol.dataset.editPesanan) bukaEditPesanan(Number(tombol.dataset.editPesanan));
  if (tombol.dataset.hapusPesanan) {
    var id = Number(tombol.dataset.hapusPesanan);
    bukaKonfirmasi('Hapus pesanan?', 'Yakin ingin menghapus? Tindakan ini tidak dapat dibatalkan. Pesanan ini juga dihapus dari rekap penjualan.', function () { hapusPesananAdmin(id); }, 'Ya, hapus pesanan');
  }
}
function exportPesanan() {
  var baris = [['ID','Waktu','Nama','No Meja','Item','Total','Status','Sudah Bayar']];
  hasilFilterPesanan().forEach(function (pesanan) {
    var items = pesanan.items.map(function (item) { return item.nama + ' x' + item.jumlah; }).join('; ');
    baris.push([pesanan.id,pesanan.waktu,pesanan.nama,pesanan.noMeja,items,pesanan.total,pesanan.status,pesanan.sudahBayar ? 'Ya' : 'Tidak']);
  });
  unduhCSV('pesanan-kedai-moi-' + tanggalBerkas() + '.csv', baris);
}
function sinkronPesananAdmin(event) {
  if (event.key === KUNCI_PESANAN || event.key === null) tampilPesananAdmin();
  if (event.key === KUNCI_MENU && adminAktif()) tampilOpsiMenuEdit();
}
document.getElementById('cari-admin-pesanan').addEventListener('input', tampilPesananAdmin); 
document.getElementById('filter-status').addEventListener('change', tampilPesananAdmin); 
document.getElementById('tabel-pesanan').addEventListener('click', klikAksiPesanan); 
document.getElementById('tabel-pesanan').addEventListener('change', perubahanPesanan); 
document.getElementById('edit-items').addEventListener('input', ubahJumlahEdit); 
document.getElementById('edit-items').addEventListener('click', hapusItemEdit); 
document.getElementById('edit-tambah-item').addEventListener('click', tambahItemEdit);
document.getElementById('form-edit-pesanan').addEventListener('submit', simpanEditPesanan); 
document.getElementById('form-edit-pesanan').addEventListener('input', koreksiEditPesanan); 
document.getElementById('export-pesanan').addEventListener('click', exportPesanan); 
window.addEventListener('storage', sinkronPesananAdmin); 
pasangAdmin(tampilPesananAdmin);
