# FF14 出團時間協調靜態網站

這是一個可以部署到 GitHub Pages 的前端靜態網站，使用 Firebase Firestore 儲存玩家資料、招募與回應。

## 功能

- 使用 Google 帳號登入，建立角色卡：角色名稱、伺服器、可使用職業與等級。
- 發起招募：選擇副本、所需陣容、活動日期區間與每日時段範圍。
- 回報時段：每半小時為單位，選擇可參加、不確定或無法參加，並依優先度選擇可使用職業（多選，第一順位為主要職業，其餘為替補）。
- 自動判斷每個時段是否可成團（先比對主要職業，缺額再看替補職業），並高亮顯示已可成團的時段。
- 管理員（`users/{uid}.isAdmin`）：新增/編輯/刪除副本定義（類型、名稱、版本、英文縮寫、需求等級、最低裝備等級、所需人數）。

詳細資料模型見 [docs/data-model.md](docs/data-model.md)。

## 使用方式

1. 將此資料夾內容推上 GitHub repo，並在 GitHub Pages 上啟用 `main` 或 `gh-pages` 分支中的靜態網站。
2. 建立 Firebase 專案：
   - 啟用 Firestore Database。
   - 啟用 Google 登入 (Google Sign-In)。
3. 編輯 `firebase-config.js`，填入你的 Firebase 專案設定：

```js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. 把 [`firestore.rules`](firestore.rules) 的內容貼到 Firebase Console → Firestore Database → 規則，並發布。目前只涵蓋 `users` 與 `characters`（登入 + 角色卡 CRUD 這一步的範圍），`dungeons` / `recruitments` 的規則會在對應功能做好時一併補上。
5. 因為用了 Google 登入的彈出視窗與 ES module 匯入，`index.html` 不能直接用 `file://` 開啟，需要跑一個本機伺服器，例如：

```bash
npx serve .
# 或
python -m http.server 8080
```

再到 Firebase Console → Authentication → Settings → 已授權網域，把本機網域（如 `localhost`）與之後的 GitHub Pages 網域都加進去。

6. 開啟網站，使用 Google 帳號登入，即可建立角色卡（角色名稱、伺服器、可用職業與等級）。

## 管理員設定

- 管理員身分由 Firestore 的 `users/{uid}.isAdmin` 欄位判斷，需在 Firebase Console（或後續的管理工具）手動將指定使用者的 `isAdmin` 設為 `true`。
- 一般使用者無法自行修改自己的 `isAdmin` 欄位，安全規則需擋掉此欄位的用戶端寫入。

## 注意事項

- 目前採用 Firebase Firestore 做為資料儲存，請確保 `firebase-config.js` 中的設定正確。
- 登入機制使用 Firebase Authentication 的 Google 登入。
