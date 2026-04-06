import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVaJbBqHrB9SpFJOKJKx4H9NF3luL49t8",
  authDomain: "presensi-kelas-b7138.firebaseapp.com",
  projectId: "presensi-kelas-b7138",
  storageBucket: "presensi-kelas-b7138.firebasestorage.app",
  messagingSenderId: "207480225579",
  appId: "1:207480225579:web:c97a528b3bef45b03f4f6e",
  measurementId: "G-7BNL5Z6CY1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let lat = null, lon = null;
let foto = "";
let stream = null;

// 📍 KOORDINAT KELAS (GANTI SESUAI LOKASI KAMU)
const kelasLat = -6.929684430614102;
const kelasLon = 107.7688228275042; 
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
  await addDoc(collection(db, "presensi"), data);

  document.getElementById("status").innerText =
    "✅ Presensi berhasil!";

} catch (err) {
  document.getElementById("status").innerText =
    "❌ Presensi gagal!";
}

await fetch("https://script.google.com/macros/s/AKfycbxVySx7NMBj8sgeQZbhr2bGMnwwPbuiMaK19d3V0-J_MT8kNTUWT9B9ySyYBuuDU4IX/exec", {
  method: "POST",
  body: JSON.stringify(data)
});
}


window.ambilFoto = ambilFoto;
window.resetKamera = resetKamera;
window.absen = absen;
