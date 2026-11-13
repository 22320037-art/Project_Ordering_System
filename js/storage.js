var KUNCI_MENU = 'kedaiMoi_menu';
var KUNCI_PESANAN = 'kedaiMoi_pesanan';
var KUNCI_ADMIN = 'kedaiMoi_admin';
var PIN_ADMIN = '1234'; 
var STATUS_PESANAN = ['Baru', 'Diproses', 'Diantar', 'Selesai', 'Dibatalkan'];
var KATEGORI_MENU = ['Makanan', 'Minuman', 'Cemilan'];
var masalahPenyimpanan = '';
var MENU_AWAL = [
  {id:1,nama:'Nasi Goreng',kategori:'Makanan',harga:20000,deskripsi:'Nasi goreng telur dengan bumbu khas Moi.',emoji:'🍛',tersedia:true},
  {id:2,nama:'Mie Goreng',kategori:'Makanan',harga:18000,deskripsi:'Mie goreng gurih, sayuran segar, dan telur.',emoji:'🍜',tersedia:true},
  {id:3,nama:'Ayam Geprek',kategori:'Makanan',harga:22000,deskripsi:'Ayam renyah, sambal bawang, dan nasi hangat.',emoji:'🍗',tersedia:true},
  {id:4,nama:'Nasi Ayam Teriyaki',kategori:'Makanan',harga:25000,deskripsi:'Ayam saus teriyaki manis gurih di atas nasi.',emoji:'🍱',tersedia:true},
  {id:5,nama:'Es Teh Manis',kategori:'Minuman',harga:5000,deskripsi:'Teh segar dengan manis yang pas.',emoji:'🧋',tersedia:true},
  {id:6,nama:'Es Jeruk',kategori:'Minuman',harga:8000,deskripsi:'Jeruk peras segar, teman makan siangmu.',emoji:'🍊',tersedia:true},
  {id:7,nama:'Kopi Susu',kategori:'Minuman',harga:15000,deskripsi:'Kopi, susu lembut, dan gula aren yang wangi.',emoji:'☕',tersedia:true},
  {id:8,nama:'Cokelat Dingin',kategori:'Minuman',harga:15000,deskripsi:'Cokelat pekat dan susu yang bikin senang.',emoji:'🥤',tersedia:true},
  {id:9,nama:'Kentang Goreng',kategori:'Cemilan',harga:12000,deskripsi:'Kentang keemasan, renyah di setiap gigitan.',emoji:'🍟',tersedia:true},
  {id:10,nama:'Pisang Goreng',kategori:'Cemilan',harga:10000,deskripsi:'Pisang manis berbalut tepung yang renyah.',emoji:'🍌',tersedia:true},
  {id:11,nama:'Roti Bakar',kategori:'Cemilan',harga:12000,deskripsi:'Roti hangat dengan cokelat dan keju.',emoji:'🍞',tersedia:true},
  {id:12,nama:'Dimsum',kategori:'Cemilan',harga:16000,deskripsi:'Empat dimsum ayam lembut dengan saus spesial.',emoji:'🥟',tersedia:true}
];
function ambilData(kunci) {
  try {
  
    var teks = localStorage.getItem(kunci); 
    if (teks === null) return [];
    var data = JSON.parse(teks);
    if (!Array.isArray(data)) throw new Error('Format data tidak sesuai.');
    return data;
  } catch (error) {
    masalahPenyimpanan = 'Data browser tidak dapat dibaca. Periksa izin penyimpanan atau cadangkan data sebelum membersihkannya.';
    return [];
  }
}
function simpanData(kunci, data) {
  try {
  
    var lama = localStorage.getItem(kunci); 
    if (lama !== null && !Array.isArray(JSON.parse(lama))) throw new Error('Data rusak');
    localStorage.setItem(kunci, JSON.stringify(data)); 
    return true;
  } catch (error) {
    if (typeof tampilToast === 'function') tampilToast('Data gagal disimpan. Periksa ruang dan izin penyimpanan browser.', 'bahaya');
    return false;
  }
}
function siapkanDataAwal() {
  try {
  
    if (localStorage.getItem(KUNCI_MENU) === null) simpanData(KUNCI_MENU, MENU_AWAL); 
    if (localStorage.getItem(KUNCI_PESANAN) === null) simpanData(KUNCI_PESANAN, []); 
  } catch (error) {
    masalahPenyimpanan = 'Local Storage tidak tersedia. Aktifkan penyimpanan browser untuk menggunakan aplikasi.';
  }
}
function buatId(daftar) {
  var terbesar = daftar.reduce(function (nilai, data) { return Math.max(nilai, data.id); }, 0);
  return Math.max(Date.now(), terbesar + 1);
}
function hitungTotal(items) {
  return items.reduce(function (total, item) { return total + item.harga * item.jumlah; }, 0);
}
// FUNGSI : adminAktif
// TUGAS  : memeriksa login demo
// INPUT  : tidak ada.
// HASIL  : boolean, false ketika storage tidak dapat diakses.
// ------------------------------------------------
function adminAktif() {
  try {
    return localStorage.getItem(KUNCI_ADMIN) === 'true'; 
  } catch (error) { return false; }
}
function wajibAdmin() {
  if (adminAktif()) return true;
  tampilToast('Silakan masuk dengan PIN admin terlebih dahulu.', 'bahaya');
  if (typeof perbaruiAksesAdmin === 'function') perbaruiAksesAdmin();
  return false;
}
function statusBerikutnya(status) {
  var alur = {Baru:['Baru','Diproses','Dibatalkan'],Diproses:['Diproses','Diantar'],Diantar:['Diantar','Selesai'],Selesai:['Selesai'],Dibatalkan:['Dibatalkan']};
  return alur[status] || [];
}

siapkanDataAwal();
