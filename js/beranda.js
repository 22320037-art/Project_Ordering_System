function tampilUnggulan() {
  var tersedia = ambilData(KUNCI_MENU).filter(function (menu) { return menu.tersedia; }); 
  var pilihan = [];
  [1,3,7,9].forEach(function (id) { var menu = tersedia.find(function (item) { return item.id === id; }); if (menu) pilihan.push(menu); });
  tersedia.forEach(function (menu) { if (pilihan.length < 4 && !pilihan.includes(menu)) pilihan.push(menu); });
  var html = pilihan.map(function (menu) { return kartuMenu(menu, true); }).join('');
  if (!html) html = tampilKosong('Menu sedang disiapkan', 'Nantikan menu lezat dari dapur Moi.', 'bag');
  document.getElementById('menu-unggulan').innerHTML = html; 
}

function sinkronUnggulan(event) { if (event.key === KUNCI_MENU || event.key === null) tampilUnggulan(); }

window.addEventListener('storage', sinkronUnggulan); 
tampilUnggulan();
