document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('downloadForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    const resultArea = document.getElementById('resultArea');
    const errorArea = document.getElementById('errorArea');
    const errorText = document.getElementById('errorText');
    const downloadLink = document.getElementById('downloadLink');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Ambil data
        const url = document.getElementById('urlInput').value;
        const renameAssets = document.getElementById('renameAssets').checked;
        const saveStructure = document.getElementById('saveStructure').checked;

        // 2. Set UI ke mode Loading
        setLoading(true);
        resultArea.classList.add('hidden');
        errorArea.classList.add('hidden');

        try {
            // 3. Kirim request ke Backend (Vercel Function)
            const response = await fetch('/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url,
                    options: {
                        renameAssets,
                        saveStructure
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal memproses website.');
            }

            if (data.error && data.error.code !== 0) {
                 throw new Error(data.error.text);
            }

            // 4. Sukses
            downloadLink.href = data.downloadUrl;
            resultArea.classList.remove('hidden');

        } catch (error) {
            // 5. Error
            console.error(error);
            errorText.innerText = error.message;
            errorArea.classList.remove('hidden');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.innerText = 'Memproses...';
            loader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.innerText = 'Mulai Proses';
            loader.classList.add('hidden');
        }
    }
});
