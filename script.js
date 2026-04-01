let lat = null, lon = null;
let foto = "";
let stream = null;

// 📍 KOORDINAT KELAS (GANTI SESUAI LOKASI KAMU)
const kelasLat = -6.9147;
const kelasLon = 107.6098;
const radius = 0.001;

// =======================
// 📍 Ambil lokasi (lebih akurat)
// =======================
navigator.geolocation.getCurrentPosition(
  pos => {
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;

    document.getElementById("lokasi").innerText =
      `📍 ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  },
  err => {
    document.getElementById("lokasi").innerText =
      "❌ Lokasi ditolak / tidak tersedia";
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
);

// =======================
// ⏰ Waktu real-time
// =======================
setInterval(() => {
  const now = new Date();
  document.getElementById("waktu").innerText =
    "⏰ " + now.toLocaleTimeString();
}, 1000);

// =======================
// 📸 Aktifkan kamera
// =======================
const video = document.getElementById('video');

function startKamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      video.style.display = "block";
    })
    .catch(() => {
      alert("❌ Kamera tidak bisa diakses");
    });
}

// langsung nyalain saat load
startKamera();

// =======================
// 📸 Ambil foto + watermark
// =======================
function ambilFoto() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  if (!video.videoWidth) {
    alert("Kamera belum siap!");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  const now = new Date();
  const waktu = now.toLocaleString();

  const latText = lat ? lat.toFixed(5) : "belum";
  const lonText = lon ? lon.toFixed(5) : "belum";

  // background transparan biar teks kebaca
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText(`⏰ ${waktu}`, 10, canvas.height - 35);
  ctx.fillText(`📍 ${latText}, ${lonText}`, 10, canvas.height - 15);

  foto = canvas.toDataURL("image/png");

  // tampilkan hasil
  const preview = document.getElementById("preview");
  preview.src = foto;
  preview.style.display = "block";

  document.getElementById("infoFoto").innerText =
    `⏰ ${waktu} | 📍 ${latText}, ${lonText}`;

  // ❌ matikan kamera
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  video.style.display = "none";
}

// =======================
// 🔄 Ambil ulang foto
// =======================
function resetKamera() {
  foto = "";
  document.getElementById("preview").style.display = "none";
  document.getElementById("infoFoto").innerText = "";

  startKamera();
}

// =======================
// 📍 Validasi lokasi
// =======================
function validasiLokasi(lat, lon) {
  const jarakLat = Math.abs(lat - kelasLat);
  const jarakLon = Math.abs(lon - kelasLon);

  return jarakLat < radius && jarakLon < radius;
}

// =======================
// 🚀 Absen
// =======================
async function absen() {
  const nama = document.getElementById("nama").value;
  const nim = document.getElementById("nim").value;

  if (!nama || !nim) {
    document.getElementById("status").innerText =
      "❌ Nama dan NIM harus diisi!";
    return;
  }

  if (!foto) {
    document.getElementById("status").innerText =
      "❌ Ambil foto dulu!";
    return;
  }

  if (!lat || !lon) {
    document.getElementById("status").innerText =
      "❌ Lokasi belum terdeteksi!";
    return;
  }

  if (!validasiLokasi(lat, lon)) {
    document.getElementById("status").innerText =
      "❌ Kamu di luar area kelas!";
    return;
  }

  const data = {
    nama,
    nim,
    lat,
    lon,
    foto,
    waktu: new Date()
  };

  try {
    const res = await fetch("http://localhost:3000/absen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById("status").innerText =
      "✅ " + result.message;

  } catch (err) {
    document.getElementById("status").innerText =
      "❌ Gagal kirim ke server!";
  }
}