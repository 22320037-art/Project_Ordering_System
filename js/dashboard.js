var grafikStatus = null;
var grafikMenu = null;

function hitungRingkasan(pesanan, menu) {
  var aktif = pesanan.filter(function (item) { return ['Baru','Diproses','Diantar'].includes(item.status); });
  var selesai = pesanan.filter(function (item) { return item.status === 'Selesai'; });
  var omzet = selesai.reduce(function (total, item) { return total + item.total; }, 0);
  return {total:pesanan.length,aktif:aktif.length,omzet:omzet,menu:menu.length};
}
function kartuStatistik(judul, nilai, keterangan, namaIkon) {
  return '<article class="stat-kartu"><div class="stat-atas"><span>' + judul + '</span><span class="kotak-icon">' + ikon(namaIkon) + '</span></div><div class="stat-angka">' + nilai + '</div><small>' + keterangan + '</small></article>';
}
function tampilStatistik(ringkasan) {
  var html = kartuStatistik('Total pesanan', ringkasan.total, 'Seluruh pesanan yang tercatat', 'bag');
  html += kartuStatistik('Pesanan aktif', ringkasan.aktif, 'Baru, diproses, dan diantar', 'clock');
  html += kartuStatistik('Total omzet', rupiah(ringkasan.omzet), 'Dari pesanan berstatus Selesai', 'wallet');
  html += kartuStatistik('Total menu', ringkasan.menu, 'Semua pilihan dalam katalog', 'grid');
  document.getElementById('statistik').innerHTML = html; // [TEKNOLOGI: DOM]
}
function menuTerlaris(pesanan) {
  var rekap = [];
  pesanan.filter(function (item) { return item.status === 'Selesai'; }).forEach(function (order) {
    order.items.forEach(function (item) {
      var ada = rekap.find(function (menu) { return menu.id === item.idMenu; });
      if (ada) ada.jumlah += item.jumlah;
      else rekap.push({id:item.idMenu,nama:item.nama,jumlah:item.jumlah});
    });
  });
  rekap.sort(function (a,b) { return b.jumlah - a.jumlah; });
  return rekap.slice(0,5);
}
// FUNGSI : tampilGrafikStatus
// TUGAS  : menggambar doughnut Chart.js
// INPUT  : array pesanan.
// HASIL  : grafik status beserta ringkasan teks yang aksesibel.
// ------------------------------------------------
function tampilGrafikStatus(pesanan) {
  var jumlah = STATUS_PESANAN.map(function (status) { return pesanan.filter(function (item) { return item.status === status; }).length; });
  var teks = STATUS_PESANAN.map(function (status,index) { return status + ': ' + jumlah[index]; }).join(' · ');
  document.getElementById('ringkas-status').textContent = teks; // [TEKNOLOGI: DOM]
  document.getElementById('kosong-status').hidden = pesanan.length > 0; // [TEKNOLOGI: DOM] Perbarui tampilan atau atribut elemen.
  if (grafikStatus) grafikStatus.destroy();
  if (typeof Chart === 'undefined') return;
  grafikStatus = new Chart(document.getElementById('grafik-status'), {type:'doughnut',data:{labels:STATUS_PESANAN,datasets:[{data:jumlah,backgroundColor:['#5d95da','#e8bc50','#a684cb','#64a67a','#d9746b'],borderWidth:4,borderColor:'#fff',hoverOffset:5}]},options:{animation:false,responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,pointStyle:'circle',boxWidth:6,padding:13,font:{size:14}}}}}});
}

// FUNGSI : tampilGrafikMenu
// TUGAS  : menggambar bar Chart.js
// INPUT  : array menu terlaris.
// HASIL  : lima batang kuantitas serta fallback teks.
// ------------------------------------------------
function tampilGrafikMenu(terlaris) {
  var nama = terlaris.map(function (item) { return item.nama; });
  var jumlah = terlaris.map(function (item) { return item.jumlah; });
  document.getElementById('ringkas-menu').textContent = terlaris.map(function (item) { return item.nama + ': ' + item.jumlah; }).join(' · '); // [TEKNOLOGI: DOM]
  document.getElementById('kosong-menu').hidden = terlaris.length > 0; // [TEKNOLOGI: DOM] Perbarui tampilan atau atribut elemen.
  if (grafikMenu) grafikMenu.destroy();
  if (typeof Chart === 'undefined') return;
  grafikMenu = new Chart(document.getElementById('grafik-menu'),{type:'bar',data:{labels:nama,datasets:[{label:'Jumlah terjual',data:jumlah,backgroundColor:['#e8590c','#ed7b3e','#f19665','#f5b18b','#f8ccb3'],borderRadius:6,maxBarThickness:38}]},options:{animation:false,responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:14}}},y:{beginAtZero:true,ticks:{precision:0,font:{size:14}},grid:{color:'#f0ece5'}}}}});
}

function tampilPesananTerbaru(pesanan) {
  var terbaru = pesanan.slice().sort(function (a,b) { return new Date(b.waktu) - new Date(a.waktu); }).slice(0,5);
  var html = terbaru.map(function (item) { return '<tr><td><strong>' + nomorPesanan(item.id) + '</strong><small>' + waktuLokal(item.waktu) + ' WITA</small></td><td>' + aman(item.nama) + '</td><td>' + item.noMeja + '</td><td><strong>' + rupiah(item.total) + '</strong></td><td>' + badgeStatus(item.status) + '</td></tr>'; }).join('');
  if (!terbaru.length) html = '<tr><td colspan="5">' + tampilKosong('Belum ada pesanan', 'Pesanan pertama akan muncul setelah pelanggan mengirimkannya.', 'bag') + '</td></tr>';
  document.getElementById('pesanan-terbaru').innerHTML = html; // [TEKNOLOGI: DOM]
}

function tampilDashboard() {
  if (!adminAktif()) return;
  var pesanan = ambilData(KUNCI_PESANAN);
  tampilStatistik(hitungRingkasan(pesanan, ambilData(KUNCI_MENU)));
  tampilGrafikStatus(pesanan);
  tampilGrafikMenu(menuTerlaris(pesanan));
  tampilPesananTerbaru(pesanan);
  if (typeof Chart === 'undefined') tampilToast('Grafik belum dapat dimuat. Ringkasan angka tetap tersedia.', 'bahaya');
}

function sinkronDashboard(event) { if ([KUNCI_MENU,KUNCI_PESANAN,null].includes(event.key)) tampilDashboard(); }

window.addEventListener('storage', sinkronDashboard); 
pasangAdmin(tampilDashboard);
