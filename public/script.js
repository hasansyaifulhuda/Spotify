// Referensi Elemen UI
const ui = {
    inputView: document.getElementById('view-input'),
    loadingView: document.getElementById('view-loading'),
    resultView: document.getElementById('view-result'),
    
    urlInput: document.getElementById('spotifyUrl'),
    searchBtn: document.getElementById('searchBtn'),
    finalDownloadBtn: document.getElementById('finalDownloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Elemen Hasil
    img: document.getElementById('albumArt'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('artistName')
};

// Variabel Global
let currentDownloadUrl = "";
let currentFileName = "music.mp3";

// Fungsi Navigasi Tampilan
function showView(viewName) {
    ui.inputView.classList.add('hidden');
    ui.loadingView.classList.add('hidden');
    ui.resultView.classList.add('hidden');

    if (viewName === 'input') ui.inputView.classList.remove('hidden');
    if (viewName === 'loading') ui.loadingView.classList.remove('hidden');
    if (viewName === 'result') ui.resultView.classList.remove('hidden');
}

// 1. EVENT: KLIK TOMBOL CARI/DOWNLOAD AWAL
ui.searchBtn.addEventListener('click', async () => {
    const url = ui.urlInput.value.trim();
    
    if (!url) {
        alert("Please paste a Spotify URL first!");
        return;
    }

    showView('loading');

    try {
        // --- REQUEST KE BACKEND (api/index.js) ---
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();

        // Cek jika status dari backend true
        // Backend Anda mengembalikan: { status: true, title: "...", artist: "...", cover: "...", download_url: "..." }
        if (response.ok && data.status === true) {
            
            // --- 1. SET GAMBAR (COVER) ---
            if (data.cover) {
                ui.img.src = data.cover;
                ui.img.style.display = 'block';
            } else {
                ui.img.src = 'https://via.placeholder.com/180?text=No+Cover';
            }

            // --- 2. SET JUDUL DAN ARTIS ---
            // Mengambil langsung dari key backend Anda
            ui.title.innerText = data.title || "Unknown Title";
            ui.artist.innerText = data.artist || "Unknown Artist";
            
            // --- 3. SIAPKAN LINK DOWNLOAD ---
            currentDownloadUrl = data.download_url;
            
            // Buat nama file bersih untuk download nanti
            const safeTitle = (data.title || "audio").replace(/[^a-z0-9]/gi, '_');
            const safeArtist = (data.artist || "").replace(/[^a-z0-9]/gi, '_');
            currentFileName = `${safeArtist} - ${safeTitle}.mp3`;

            // Tampilkan hasil
            showView('result');

        } else {
            // Jika backend mengirim status: false atau error
            throw new Error(data.message || data.error || "Failed to process track");
        }
    } catch (error) {
        console.error(error);
        alert("Gagal memproses link. Pastikan link Spotify valid.");
        showView('input');
    }
});

// 2. EVENT: KLIK TOMBOL DOWNLOAD FINAL (Direct Download)
ui.finalDownloadBtn.addEventListener('click', (e) => {
    // Mencegah redirect halaman
    e.preventDefault(); 

    if (!currentDownloadUrl) {
        alert("Link download belum siap.");
        return;
    }

    // Trik download otomatis tanpa pindah tab
    const link = document.createElement('a');
    link.href = currentDownloadUrl;
    link.setAttribute('download', currentFileName); // Suggest nama file
    link.target = "_self"; // Paksa di tab yang sama
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    
    // Hapus elemen link setelah diklik
    setTimeout(() => {
        document.body.removeChild(link);
    }, 100);
});

// Fitur Reset
ui.resetBtn.addEventListener('click', () => {
    ui.urlInput.value = '';
    ui.img.src = '';
    showView('input');
});

// Support tombol Enter
ui.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ui.searchBtn.click();
});

// Init
showView('input');
