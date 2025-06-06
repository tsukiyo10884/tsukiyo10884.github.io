async function convertImagesToImgur(htmlString, clientId) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const imgTags = doc.querySelectorAll('img');

    for (const img of imgTags) {
        const url = img.src;

        try {
            const res = await fetch(url, { mode: 'cors' });
            const blob = await res.blob();

            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]); // 只取 base64 純資料
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const uploadRes = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    Authorization: `Client-ID ${clientId}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64, type: 'base64' })
            });

            const uploadJson = await uploadRes.json();
            if (uploadJson.success) {
                img.src = uploadJson.data.link;
            } else {
                console.warn(`Imgur 上傳失敗：${url}`);
            }
        } catch (err) {
            console.warn(`無法處理圖片 ${url}：`, err);
        }
    }

    return doc.body.innerHTML;
}
