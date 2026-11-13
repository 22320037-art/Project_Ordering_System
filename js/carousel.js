var elemenCarousel = document.getElementById("carousel-beranda");
var slideCarousel = document.querySelectorAll(".carousel-slide");
var titikCarousel = document.querySelectorAll("[data-slide]");
var indeksCarousel = 0;
var jedaCarousel = window.matchMedia("(prefers-reduced-motion: reduce)");
var carouselBerjalan = !jedaCarousel.matches;
var posisiSentuhX = 0;
var posisiSentuhY = 0;
var sentuhanCarousel = false;

function tampilSlideCarousel(indeks) {
  indeksCarousel = (indeks + slideCarousel.length) % slideCarousel.length;
  slideCarousel.forEach(function (slide, urutan) {
    slide.hidden = urutan !== indeksCarousel; 
  });
  titikCarousel.forEach(function (titik, urutan) {
    titik.classList.toggle("aktif", urutan === indeksCarousel); 
    titik.setAttribute("aria-pressed", String(urutan === indeksCarousel)); 
  });
  document.getElementById("nomor-slide").textContent =
    "0" + (indeksCarousel + 1) + " / 03"; 
  document.getElementById("status-carousel").textContent =
    "Slide " + (indeksCarousel + 1) + " dari 3.";
}
function perbaruiTombolPutar() {
  var tombol = document.getElementById("putar-carousel");
  var jalur = '<path d="M9 5v14M15 5v14"/>';
  if (!carouselBerjalan) jalur = '<path d="m8 5 11 7-11 7V5Z"/>';
  tombol.innerHTML =
    '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">' +
    jalur +
    "</svg>"; 
  tombol.setAttribute(
    "aria-label",
    carouselBerjalan ? "Jeda carousel" : "Putar carousel",
  ); 
}

function jedakanCarousel() {
  carouselBerjalan = false;
  perbaruiTombolPutar();
}

function pilihSlideCarousel(indeks) {
  jedakanCarousel();
  document
    .getElementById("status-carousel")
    .setAttribute("aria-live", "polite"); 
  tampilSlideCarousel(indeks);
}

function klikKontrolCarousel(event) {
  var tombol = event.target.closest("button");
  if (!tombol) return;
  if (tombol.hasAttribute("data-slide"))
    pilihSlideCarousel(Number(tombol.dataset.slide));
  if (tombol.id === "slide-sebelumnya") pilihSlideCarousel(indeksCarousel - 1);
  if (tombol.id === "slide-berikutnya") pilihSlideCarousel(indeksCarousel + 1);
  if (tombol.id === "putar-carousel") {
    carouselBerjalan = !carouselBerjalan;
    document.getElementById("status-carousel").setAttribute("aria-live", "off"); 
    perbaruiTombolPutar();
  }
}

function jalankanCarouselOtomatis() {
  if (!carouselBerjalan || document.hidden || elemenCarousel.matches(":hover"))
    return;
  tampilSlideCarousel(indeksCarousel + 1);
}

function fokusCarousel(event) {
  if (event.target.id !== "putar-carousel") jedakanCarousel();
}

function keyboardCarousel(event) {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    pilihSlideCarousel(indeksCarousel - 1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    pilihSlideCarousel(indeksCarousel + 1);
  }
}

function mulaiSentuhCarousel(event) {
  sentuhanCarousel =
    event.pointerType === "touch" && !event.target.closest("a, button");
  posisiSentuhX = event.clientX;
  posisiSentuhY = event.clientY;
}

function selesaiSentuhCarousel(event) {
  if (!sentuhanCarousel) return;
  sentuhanCarousel = false;
  var jarakX = event.clientX - posisiSentuhX;
  var jarakY = event.clientY - posisiSentuhY;
  if (Math.abs(jarakX) < 50 || Math.abs(jarakX) <= Math.abs(jarakY)) return;
  if (jarakX < 0) pilihSlideCarousel(indeksCarousel + 1);
  else pilihSlideCarousel(indeksCarousel - 1);
}

elemenCarousel.addEventListener("click", klikKontrolCarousel);
elemenCarousel.addEventListener("focusin", fokusCarousel);
elemenCarousel.addEventListener("keydown", keyboardCarousel);
elemenCarousel.addEventListener("pointerdown", mulaiSentuhCarousel, {
  passive: true,
});
elemenCarousel.addEventListener("pointerup", selesaiSentuhCarousel, {
  passive: true,
});
jedaCarousel.addEventListener("change", jedakanCarousel); 
setInterval(jalankanCarouselOtomatis, 6000);
tampilSlideCarousel(0);
perbaruiTombolPutar();
