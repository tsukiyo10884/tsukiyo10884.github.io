// Dev helper: creates 8 test character cards (2T / 2H / 4D, all Lv.70) under the
// currently logged-in account. NOT loaded by index.html — paste into the browser
// DevTools console while the app is open and you're logged in, see README.md.
//
// Reuses the same Firebase app/auth session app.js already initialized on the page
// (getApp() with no name returns that existing instance), so this just needs you to
// already be signed in — it does not sign in on its own.

(async () => {
  const { getApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
  const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
  const { getFirestore, collection, addDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
  );

  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (!auth.currentUser) {
    console.error('請先在網頁上用 Google 登入，再執行這個腳本。');
    return;
  }

  const ownerId = auth.currentUser.uid;
  const server = '伊弗利特';

  // 2 tanks, 2 healers, 4 DPS — all Lv.70, matches a 2T2H4D comp.
  const characters = [
    { name: '艾爾文德', jobs: { PLD: 70 } },
    { name: '布蘭卡爾', jobs: { WAR: 70 } },
    { name: '賽蓮月影', jobs: { WHM: 70 } },
    { name: '諾娃星辰', jobs: { AST: 70 } },
    { name: '武一郎', jobs: { MNK: 70 } },
    { name: '忍影丸', jobs: { NIN: 70 } },
    { name: '樂吟風', jobs: { BRD: 70 } },
    { name: '黑魔理', jobs: { BLM: 70 } }
  ];

  for (const c of characters) {
    await addDoc(collection(db, 'characters'), {
      ownerId,
      name: c.name,
      server,
      jobs: c.jobs,
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('已建立角色卡：', c.name, c.jobs);
  }

  console.log('完成！8 張角色卡都建好了（2T / 2H / 4D，Lv.70）。');
})();
