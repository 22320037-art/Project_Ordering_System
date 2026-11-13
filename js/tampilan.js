var FOTO_MENU_MOI = {
  "nasi goreng": 1,
  "mie goreng": 2,
  "ayam geprek": 3,
  "nasi ayam teriyaki": 4,
  "es teh manis": 5,
  "es jeruk": 6,
  "kopi susu": 7,
  "cokelat dingin": 8,
  "kentang goreng": 9,
  "pisang goreng": 10,
  "roti bakar": 11,
  dimsum: 12,
};

function beriFotoMenu(gambar, nama) {
  if (!gambar || !nama) return;
  var nomor = FOTO_MENU_MOI[nama.trim().toLocaleLowerCase("id")];
  if (!Number.isInteger(nomor)) return;
  gambar.classList.add("foto-menu", "foto-menu-" + nomor); 
}

function fotoPadaKartu(kartu) {
  var nama = kartu.querySelector(".kartu-isi h3");
  if (nama) beriFotoMenu(kartu.querySelector(".menu-gambar"), nama.textContent);
}

function fotoPadaBaris(baris) {
  var nama = baris.querySelector("strong");
  var gambar =
    baris.querySelector(".item-emoji") || baris.querySelector(":scope > span");
  if (nama) beriFotoMenu(gambar, nama.textContent);
}

function perbaruiFotoMenu() {
  document.querySelectorAll(".kartu-menu").forEach(fotoPadaKartu);
  document
    .querySelectorAll(".nama-menu-sel, .keranjang-item")
    .forEach(fotoPadaBaris);
}

function amatiWadahMenu(id) {
  var wadah = document.getElementById(id);
  if (!wadah) return;
  var pengamat = new MutationObserver(perbaruiFotoMenu); 
  pengamat.observe(wadah, { childList: true });
}

["menu-unggulan", "grid-menu", "tabel-menu", "isi-keranjang"].forEach(
  amatiWadahMenu,
);
perbaruiFotoMenu();
