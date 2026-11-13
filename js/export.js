function tanggalBerkas() { return new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Makassar'}).format(new Date()); }

function selCSV(nilai) {
  var teks = String(nilai);
  if (/^[\s]*[=+@-]/.test(teks)) teks = "'" + teks;
  return '"' + teks.replace(/"/g, '""') + '"';
}

function unduhCSV(namaFile, baris) {
  if (!wajibAdmin()) return;
  var isi = baris.map(function (barisData) { return barisData.map(selCSV).join(','); }).join('\r\n');
  var berkas = new Blob(['\uFEFF' + isi], {type:'text/csv;charset=utf-8;'});
  var alamat = URL.createObjectURL(berkas);
  var tautan = document.createElement('a'); 
  tautan.href = alamat;
  tautan.download = namaFile;
  document.body.appendChild(tautan);
  tautan.click();
  tautan.remove();
  setTimeout(function () { URL.revokeObjectURL(alamat); }, 1000);
  tampilToast('File CSV sedang diunduh.', 'info');
}
