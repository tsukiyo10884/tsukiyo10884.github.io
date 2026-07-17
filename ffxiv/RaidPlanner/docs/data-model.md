# Firestore 資料模型 v1

## 總覽

| Collection | 說明 | 誰能寫 |
|---|---|---|
| `users/{uid}` | Google 登入後的使用者基本資料 + 管理員標記 | 本人（isAdmin 除外，由後台手動設定） |
| `characters/{characterId}` | 角色卡 | 卡片擁有者 |
| `dungeons/{dungeonId}` | 副本設定 | 管理員 |
| `recruitments/{recruitmentId}` | 招募單 | 建立者（狀態切換）；其他欄位建立時寫入後多為唯讀 |
| `recruitments/{id}/responses/{uid}` | 每人對該招募的回應（職業選擇 + 各時段狀態） | 該回應的本人 |

---

## 1. `users/{uid}`

文件 ID 直接用 Firebase Auth 的 uid。

```json
{
  "displayName": "Irene",
  "email": "irene@example.com",
  "isAdmin": false,
  "createdAt": "2026-07-16T10:00:00Z"
}
```

- 不儲存 `photoURL`：不顯示使用者的 Google 頭像，UI 上需要圖示的地方（例如使用者列表、角色卡列表）一律用同一顆預設圖示，不做個人化大頭貼。

- `isAdmin`：不開放使用者自己修改，只能由管理員在 Firestore console 或另一支管理工具改，安全規則要擋掉一般使用者對這個欄位的寫入。

---

## 2. `characters/{characterId}`

角色卡，一個使用者可以有多張。用獨立 top-level collection（不當 users 的子集合），方便之後如果要「瀏覽所有角色卡」或跨招募引用時查詢。

```json
{
  "ownerId": "uid_abc",
  "name": "光之戰士",
  "server": "伊弗利特",
  "jobs": {
    "WAR": 100,
    "WHM": 90,
    "RDM": 80
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `server` 從固定的 7 個伺服器（伊弗利特、迦樓羅、利維坦、鳳凰、奧汀、巴哈姆特、泰坦）下拉選擇，前端用 `<select>` 限制輸入值。
- `jobs` 用 map（職業代號 → 等級），只放這個角色實際有練的職業，不用把 20 個職業都塞 0。
- 職業清單（PLD/WAR/.../BLU）維持像現在 `app.js` 裡的 `JOBS` 常數，寫死在前端就好，不用進 Firestore —— 這份清單只有版本更新出新職業時才會變，管理員需求裡也沒提到要能管理職業列表。
- 查詢：`where('ownerId', '==', uid)` 取得「我的角色卡」。

---

## 3. `dungeons/{dungeonId}`

管理員維護。

```json
{
  "type": "TRIAL",
  "name": "夢羽狼氏族的巢窟",
  "version": "7.2",
  "abbr": "M1S",
  "levelRequirement": 100,
  "minItemLevel": 720,
  "ilvlSync": 715,
  "maxParticipants": 8,
  "createdBy": "uid_admin",
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `type`：字串 enum，對應遊戲內的內容類型（也對應 `img/duty-types/` 底下的圖示）：`DUNGEON`（迷宮探索）/ `GUILDHEST`（公會令）/ `TRIAL`（討伐戰）/ `RAID`（大型任務）/ `ULTIMATE`（絕境戰）/ `CHAOTIC`（混沌任務）/ `CARNIVALE`（假面狂歡騷動），前端用下拉選單限制輸入值。
- `abbr`：選填，副本英文縮寫（如 `M1S`），方便招募單標題簡短顯示。
- `levelRequirement`：角色等級需求，用來檔「回應者選擇職業時，該職業等級是否達標」。
- `minItemLevel`：選填，最低裝備等級需求；沒有裝等限制的內容（如一般迷宮）可以留空。
- `ilvlSync`：選填，該內容的裝備品級同步數值；沒有同步限制的內容可以留空。
- `maxParticipants`：固定四選一：`4` / `8` / `12` / `24`，前端用下拉選單限制輸入值。
- 只有管理員（`users/{uid}.isAdmin === true`）能新增/編輯/刪除，見 [firestore.rules](../firestore.rules)；所有登入使用者都能讀取列表。

---

## 4. `recruitments/{recruitmentId}`

招募單本體，時段表的「欄位定義」也放在這裡。

```json
{
  "dungeonId": "dungeon_123",
  "creatorId": "uid_abc",
  "composition": { "T": 2, "H": 2, "D": 4, "FREE": 0 },
  "itemLevelRequirement": 730,
  "specialRules": {
    "unrestricted": false,
    "echoDisabled": false,
    "minItemLevelRule": false,
    "levelSync": false
  },
  "notes": "不趕尾刀，全通就好",
  "status": "recruiting",
  "dateRange": { "start": "2026-07-10", "end": "2026-07-15" },
  "dailyTimeRange": { "start": "20:00", "end": "03:00" },
  "slotMinutes": 30,
  "timeSlots": [
    { "slotId": "2026-07-10_20:00", "date": "2026-07-10", "startTime": "20:00", "endTime": "20:30", "sessionDate": "2026-07-10", "dayOffset": 0 },
    { "slotId": "2026-07-11_00:00", "date": "2026-07-11", "startTime": "00:00", "endTime": "00:30", "sessionDate": "2026-07-10", "dayOffset": 1 }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

- `status`: `"recruiting" | "paused" | "full" | "disbanded"`（招募中 / 暫停 / 滿團 / 流團），對應需求 2 的「暫停招募、滿團出發、流團」；只有 `creatorId` 本人能切換。只有 `status === "recruiting"` 時才能回應（顯示「響應招募」按鈕）。切到 `disbanded` 後該招募就鎖住：不能再編輯內容或切換狀態（[firestore.rules](../firestore.rules) 在規則層也擋掉了），但建立者仍可以刪除整個招募。
- `composition`：所需陣容，固定四個數字欄位 `T`（坦克）/ `H`（治療）/ `D`（輸出）/ `FREE`（自由位）。建立/編輯時，若 `specialRules.unrestricted` 為 `false`，四個數字總和必須等於該副本 `dungeons.maxParticipants`；勾選「解除限制」後就不做這個檢查。
- `itemLevelRequirement`：選填，這次招募額外要求的品級（可能比副本本身的 `minItemLevel`更嚴格，例如進度團想要更高裝等）。
- `specialRules`：四個布林值特殊規則旗標，對應遊戲內的招募條件勾選：`unrestricted`（解除限制）/ `echoDisabled`（超越之力無效化）/ `minItemLevelRule`（最低品級）/ `levelSync`（等級同步）。
- 建立招募時輸入 `dateRange`（日期區間，每個日期代表一個「場次的開始日」）+ `dailyTimeRange`（每天套用的時間區間），系統依 `slotMinutes`（固定 30 分鐘）自動展開成 `timeSlots` 陣列。`dateRange` / `dailyTimeRange` 保留下來是為了未來若要「重新展開」或編輯時段範圍時還原輸入條件；實際渲染表格與寫入回應都是用展開後的 `timeSlots` / `slotId`。
- `dailyTimeRange.end` 可以早於 `dailyTimeRange.start`，代表跨日場次（例如 `20:00 ~ 03:00`）。這種情況下 `timeSlots` 裡每個時段除了實際的 `date`/`startTime` 外，還會帶 `sessionDate`（場次開始日，即 `dateRange` 裡的那個日期）與 `dayOffset`（0＝場次當天，1＝跨到隔天），讓時段表能把 20:00~23:30 跟隔天 00:00~03:00 顯示成同一列、中間用分隔線隔開，符合玩家「晚上開團到半夜」的習慣。同日場次（未跨日）時 `dayOffset` 一律是 `0`，等同 `sessionDate === date`。
- 只有 `creatorId` 本人能編輯/刪除，見 [firestore.rules](../firestore.rules)；所有登入使用者都能讀取列表（時段表對所有人可見）。

---

## 5. `recruitments/{recruitmentId}/responses/{uid}`

子集合，一人一張，文件 ID 直接用回應者的 uid（同一人重複回應直接覆蓋，不用額外查詢）。

```json
{
  "uid": "uid_def",
  "characterId": "char_456",
  "characterName": "光之戰士",
  "characterServer": "伊弗利特",
  "jobPriority": ["WAR", "PLD"],
  "availability": {
    "2026-07-10_15:00": "available",
    "2026-07-10_15:30": "tentative",
    "2026-07-10_16:00": "unavailable"
  },
  "updatedAt": "..."
}
```

- `jobPriority`：**有序**陣列，`[0]` 是這次出團想主要使用的職業，後面依序是「若主要職業湊不進陣容，願意頂替的職業」。前端只讓使用者勾選「該角色卡等級 ≥ dungeon.levelRequirement」的職業，勾選順序即優先度。
- `characterName` / `characterServer`：存回應當下角色卡的名稱與伺服器快照，避免顯示時段表名單時還要額外查詢其他使用者的 `characters` 文件（一般使用者的 `characters` 讀取權限雖然開放，但只在自己的頁面訂閱自己的角色卡；名單顯示用快照資料簡單很多）。角色卡改名不會回頭更新舊回應裡的快照。
- `availability`：key 對應 `recruitments.timeSlots[].slotId`，值是 `available | tentative | unavailable` 三選一；只有勾了值的時段才會出現在這個 map 裡。
- 所有人都能讀這個子集合（時段表對所有人可見），但只有 `request.auth.uid == uid`（文件 ID）本人能寫，見 [firestore.rules](../firestore.rules)。

---

## 6. 時段「醒目提示」怎麼算

不特別做 Cloud Function，前端即時監聽某招募底下全部 `responses`（`app.js` 的 `computeSlotStatus()`），對每個 `slotId` 跑一個三輪貪婪比對，對照 `recruitments.composition`（`{T, H, D, FREE}` 四個數字桶）：

1. 篩出 `availability[slotId] == 'available'` 的回應，每人手上是一份有序的 `jobPriority`。
2. **第一輪（主要職業）**：每人先用 `jobPriority[0]` 對應的職業分類（T/H/D，來自 `JOBS` 常數的 `category`）去佔對應桶的名額。
3. **第二輪（替補）**：第一輪沒佔到名額的人，依序嘗試 `jobPriority[1]`、`[2]`... 的職業分類，去補還有名額的桶。
4. **第三輪（自由位遞補）**：前兩輪都沒佔到名額的人，只要 `FREE` 桶還有剩，就直接佔一個自由位（不看職業分類）。
5. 三輪跑完看四個桶還剩多少名額（`remaining`）：
   - `remaining === 0` → 綠色高亮「可成團」（`status-complete`）。
   - `remaining` 為 1～2 → 黃色提醒「快滿了」（`status-potential`）。
   - 其餘不特別標示。

這是一版「可行但非最優」的貪婪規則。如果之後發現貪婪法在人多、職業重疊複雜時會漏掉本來湊得出來的組合，可以再換成正式的二分圖最大匹配演算法，但現階段規模（一個招募最多 24 人 + 少數替補）先不需要做到這麼複雜。

這段邏輯純前端算，即時監聽的資料量在這個規模下完全夠用；時段表點選某一格會顯示該時段的媒合結果與完整名單（依 可參加／不確定／無法參加 分組）。

---

## 已確認的決定

1. **管理員身分**：以 `users/{uid}.isAdmin` 判斷，後台手動設定。
2. **登入方式**：Google 登入。
3. **`jobPriority` 語意**：有序清單，`[0]` 為主要職業，其餘為依序替補；名額比對採「主要職業 → 替補職業 → 自由位遞補」三輪貪婪法（見上方第 6 節）。
4. **時段表產生方式**：建立招募時輸入日期區間 + 每日時間區間（如 7/10~7/15、15:00~23:00），系統自動以每 30 分鐘展開時段，不支援手動增刪個別時段。
5. **陣容模型**：從「role/jobKey 陣列」簡化成固定的 `{T, H, D, FREE}` 四個數字欄位（見第 4 節），未勾選「解除限制」時總和必須等於副本 `maxParticipants`。
6. **回應狀態儲存方式**：時段格子點擊會先在前端暫存（`draftAvailability` 等變數），要按「儲存我的回應」才會一次寫入 Firestore，避免每格點擊都各自打一次 API；其他使用者看到的則是已儲存的即時資料（`onSnapshot`）。

## 之後可以做的延伸

- 目前的醒目提示比對是貪婪法，人數規模變大或陣容需求變複雜時可以考慮換成二分圖最大匹配。
- 角色卡改名後，舊回應裡 `characterName`/`characterServer` 快照不會自動更新，如果之後需要保持同步，可以改成回應時只存 `characterId`、顯示時即時查詢，或用 Cloud Function 在角色卡更新時回寫既有回應。
