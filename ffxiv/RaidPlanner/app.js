import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const JOB_GROUPS = [
  { key: 'TANK', label: '防護職業' },
  { key: 'HEALER', label: '治療職業' },
  { key: 'MELEE', label: '近戰職業' },
  { key: 'PRANGED', label: '遠程物理職業' },
  { key: 'MRANGED', label: '遠程魔法職業' }
];

const JOBS = [
  { key: 'PLD', name: '騎士', abbr: '騎士', category: 'T', group: 'TANK' },
  { key: 'WAR', name: '戰士', abbr: '戰士', category: 'T', group: 'TANK' },
  { key: 'DRK', name: '暗黑騎士', abbr: '暗騎', category: 'T', group: 'TANK' },
  { key: 'GNB', name: '絕槍戰士', abbr: '絕槍', category: 'T', group: 'TANK' },
  { key: 'WHM', name: '白魔道士', abbr: '白魔', category: 'H', group: 'HEALER' },
  { key: 'SCH', name: '學者', abbr: '學者', category: 'H', group: 'HEALER' },
  { key: 'AST', name: '占星術士', abbr: '占星', category: 'H', group: 'HEALER' },
  { key: 'SGE', name: '賢者', abbr: '賢者', category: 'H', group: 'HEALER' },
  { key: 'MNK', name: '武僧', abbr: '武僧', category: 'D', group: 'MELEE' },
  { key: 'DRG', name: '龍騎士', abbr: '龍騎', category: 'D', group: 'MELEE' },
  { key: 'NIN', name: '忍者', abbr: '忍者', category: 'D', group: 'MELEE' },
  { key: 'SAM', name: '武士', abbr: '武士', category: 'D', group: 'MELEE' },
  { key: 'RPR', name: '奪魂者', abbr: '鐮刀', category: 'D', group: 'MELEE' },
  { key: 'VNM', name: '毒蛇劍士', abbr: '毒蛇', category: 'D', group: 'MELEE' },
  { key: 'BRD', name: '吟遊詩人', abbr: '詩人', category: 'D', group: 'PRANGED' },
  { key: 'MCH', name: '機工士', abbr: '機工', category: 'D', group: 'PRANGED' },
  { key: 'DNC', name: '舞者', abbr: '舞者', category: 'D', group: 'PRANGED' },
  { key: 'BLM', name: '黑魔道士', abbr: '黑魔', category: 'D', group: 'MRANGED' },
  { key: 'SMN', name: '召喚士', abbr: '召喚', category: 'D', group: 'MRANGED' },
  { key: 'RDM', name: '赤魔道士', abbr: '赤魔', category: 'D', group: 'MRANGED' },
  { key: 'PCT', name: '繪靈法師', abbr: '繪靈', category: 'D', group: 'MRANGED' },
  { key: 'BLU', name: '青魔道士', abbr: '青魔', category: 'D', group: 'MRANGED' }
];

const JOB_ICON_PATH = (key) => `img/jobs/${key}.png`;

const DUNGEON_TYPES = [
  { key: 'DUNGEON', label: '迷宮探索' },
  { key: 'GUILDHEST', label: '公會令' },
  { key: 'TRIAL', label: '討伐戰' },
  { key: 'RAID', label: '大型任務' },
  { key: 'ULTIMATE', label: '絕' },
  { key: 'CHAOTIC', label: '滅' },
  { key: 'CARNIVALE', label: '青魔筆記' }
];

const DUNGEON_ICON_PATH = (key) => `img/duty-types/${key}.png`;

const ROLE_ICON_PATH = (key) => `img/roles/${key}.png`;

const DEFAULT_AVATAR_SVG = `
<svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="rgba(148,163,184,0.18)" />
  <circle cx="12" cy="9.5" r="3.6" fill="rgba(226,232,240,0.85)" />
  <path d="M4.5 20c1.2-3.8 4.2-5.8 7.5-5.8s6.3 2 7.5 5.8" stroke="rgba(226,232,240,0.85)" stroke-width="1.8" stroke-linecap="round" fill="none" />
</svg>`;

const THEME_STORAGE_KEY = 'raidplanner-theme';
const themeToggleButton = document.getElementById('theme-toggle');

function getEffectiveTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  themeToggleButton.textContent = getEffectiveTheme() === 'light' ? '☀️' : '🌙';
}

applyTheme(localStorage.getItem(THEME_STORAGE_KEY));

themeToggleButton.addEventListener('click', () => {
  const next = getEffectiveTheme() === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_STORAGE_KEY, next);
  applyTheme(next);
});

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) applyTheme(null);
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const authArea = document.getElementById('auth-area');
const loginPanel = document.getElementById('login-panel');
const charactersPanel = document.getElementById('characters-panel');
const loginButton = document.getElementById('login-button');
const anonymousLoginButton = document.getElementById('anonymous-login-button');
const characterListEl = document.getElementById('character-list');
const characterDetailEl = document.getElementById('character-detail');
const addCharacterButton = document.getElementById('add-character-button');
const characterModal = document.getElementById('character-modal');
const characterModalTitle = document.getElementById('character-modal-title');
const characterModalClose = document.getElementById('character-modal-close');
const characterCancel = document.getElementById('character-cancel');
const characterForm = document.getElementById('character-form');
const characterNameInput = document.getElementById('character-name');
const characterServerInput = document.getElementById('character-server');
const characterNotesInput = document.getElementById('character-notes');
const toastEl = document.getElementById('toast');
const characterNoteModal = document.getElementById('character-note-modal');
const characterNoteModalTitle = document.getElementById('character-note-modal-title');
const characterNoteModalText = document.getElementById('character-note-modal-text');
const characterNoteModalClose = document.getElementById('character-note-modal-close');

const appNav = document.getElementById('app-nav');
const dungeonsTabButton = document.getElementById('dungeons-tab-button');
const dungeonsPanel = document.getElementById('dungeons-panel');
const dungeonListEl = document.getElementById('dungeon-list');
const dungeonDetailEl = document.getElementById('dungeon-detail');
const addDungeonButton = document.getElementById('add-dungeon-button');
const dungeonModal = document.getElementById('dungeon-modal');
const dungeonModalTitle = document.getElementById('dungeon-modal-title');
const dungeonModalClose = document.getElementById('dungeon-modal-close');
const dungeonCancel = document.getElementById('dungeon-cancel');
const dungeonForm = document.getElementById('dungeon-form');
const dungeonTypeInput = document.getElementById('dungeon-type');
const dungeonNameInput = document.getElementById('dungeon-name');
const dungeonVersionInput = document.getElementById('dungeon-version');
const dungeonAbbrInput = document.getElementById('dungeon-abbr');
const dungeonLevelInput = document.getElementById('dungeon-level');
const dungeonIlvlInput = document.getElementById('dungeon-ilvl');
const dungeonIlvlSyncInput = document.getElementById('dungeon-ilvl-sync');
const dungeonSizeInput = document.getElementById('dungeon-size');

const recruitmentsPanel = document.getElementById('recruitments-panel');
const recruitmentListEl = document.getElementById('recruitment-list');
const recruitmentDetailEl = document.getElementById('recruitment-detail');
const addRecruitmentButton = document.getElementById('add-recruitment-button');
const recruitmentModal = document.getElementById('recruitment-modal');
const recruitmentModalTitle = document.getElementById('recruitment-modal-title');
const recruitmentModalClose = document.getElementById('recruitment-modal-close');
const recruitmentCancel = document.getElementById('recruitment-cancel');
const recruitmentForm = document.getElementById('recruitment-form');
const recruitmentDungeonInput = document.getElementById('recruitment-dungeon');
const compTInput = document.getElementById('comp-t');
const compHInput = document.getElementById('comp-h');
const compDInput = document.getElementById('comp-d');
const compFreeInput = document.getElementById('comp-free');
const recruitmentIlvlInput = document.getElementById('recruitment-ilvl');
const ruleUnrestrictedInput = document.getElementById('rule-unrestricted');
const ruleEchoDisabledInput = document.getElementById('rule-echo-disabled');
const ruleMinIlvlInput = document.getElementById('rule-min-ilvl');
const ruleLevelSyncInput = document.getElementById('rule-level-sync');
const recruitmentDateStartInput = document.getElementById('recruitment-date-start');
const recruitmentDateEndInput = document.getElementById('recruitment-date-end');
const recruitmentTimeStartInput = document.getElementById('recruitment-time-start');
const recruitmentTimeEndInput = document.getElementById('recruitment-time-end');
const recruitmentNotesInput = document.getElementById('recruitment-notes');

const RECRUITMENT_STATUS_LABELS = {
  recruiting: '招募中',
  paused: '已暫停',
  full: '滿團出發',
  disbanded: '已流團'
};

let currentUser = null;
let currentUserIsAdmin = false;
let unsubscribeCharacters = null;
let characters = [];
let selectedCharacterId = null;
let editingCharacterId = null;

let unsubscribeDungeons = null;
let dungeons = [];
let selectedDungeonId = null;
let editingDungeonId = null;

let unsubscribeRecruitments = null;
let recruitments = [];
let selectedRecruitmentId = null;
let editingRecruitmentId = null;

let unsubscribeResponses = null;
let responses = [];
let selectedSlotId = null;
let isRespondingToRecruitment = false;

// Which role (T/H/D) each responder is currently shown under as "主選" in the
// "可參加" role table for the selected slot — keyed by response uid. This is a pure
// front-end simulation (never written to Firestore): defaults to the category of the
// responder's jobPriority[0], and clicking one of their "備選" entries moves them to
// that role instead. Reset whenever a different slot or recruitment is selected.
let slotRoleActiveOverride = {};

let draftRecruitmentId = null;
let draftCharacterId = '';
let draftJobPriority = [];
let draftAvailability = {};

const AVAILABILITY_LABELS = {
  available: '可參加',
  tentative: '不確定',
  unavailable: '無法參加'
};

let toastTimer = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 3200);
}

function switchTab(panelId) {
  document.querySelectorAll('#app-nav .tab-button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === panelId);
  });
  charactersPanel.classList.toggle('active-panel', panelId === 'characters-panel');
  charactersPanel.classList.toggle('hidden', panelId !== 'characters-panel');
  dungeonsPanel.classList.toggle('active-panel', panelId === 'dungeons-panel');
  dungeonsPanel.classList.toggle('hidden', panelId !== 'dungeons-panel');
  recruitmentsPanel.classList.toggle('active-panel', panelId === 'recruitments-panel');
  recruitmentsPanel.classList.toggle('hidden', panelId !== 'recruitments-panel');
}

document.querySelectorAll('#app-nav .tab-button').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function renderAuthArea() {
  authArea.innerHTML = '';
  if (!currentUser) return;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '12px';

  const avatar = document.createElement('span');
  avatar.innerHTML = DEFAULT_AVATAR_SVG;
  wrap.appendChild(avatar);

  const name = document.createElement('span');
  name.textContent = currentUser.isAnonymous
    ? '匿名玩家'
    : currentUser.displayName || currentUser.email || '玩家';
  wrap.appendChild(name);

  const logoutButton = document.createElement('button');
  logoutButton.className = 'secondary-button';
  logoutButton.textContent = '登出';
  logoutButton.addEventListener('click', () => signOut(auth));
  wrap.appendChild(logoutButton);

  authArea.appendChild(wrap);
}

function openCharacterModal(character = null) {
  editingCharacterId = character ? character.id : null;
  characterModalTitle.textContent = character ? '編輯角色卡' : '新增角色卡';
  characterNameInput.value = character ? character.name : '';
  characterServerInput.value = character ? character.server : '';
  characterNotesInput.value = character ? character.notes || '' : '';
  characterModal.classList.remove('hidden');
}

function closeCharacterModal() {
  characterModal.classList.add('hidden');
  characterForm.reset();
  editingCharacterId = null;
}

addCharacterButton.addEventListener('click', () => openCharacterModal());
characterModalClose.addEventListener('click', closeCharacterModal);
characterCancel.addEventListener('click', closeCharacterModal);

characterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = characterNameInput.value.trim();
  const server = characterServerInput.value.trim();
  const notes = characterNotesInput.value.trim();

  if (!name || !server) {
    showToast('請填寫角色名稱與伺服器');
    return;
  }

  try {
    if (editingCharacterId) {
      await updateDoc(doc(db, 'characters', editingCharacterId), {
        name,
        server,
        notes,
        updatedAt: serverTimestamp()
      });
      showToast('角色卡已更新');
    } else {
      await addDoc(collection(db, 'characters'), {
        ownerId: currentUser.uid,
        name,
        server,
        notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      showToast('角色卡已建立');
    }
    closeCharacterModal();
  } catch (err) {
    showToast(`儲存失敗：${err.message}`);
  }
});

async function deleteCharacter(characterId) {
  if (!confirm('確定要刪除這張角色卡嗎？此動作無法復原。')) return;
  try {
    await deleteDoc(doc(db, 'characters', characterId));
    if (selectedCharacterId === characterId) selectedCharacterId = null;
    showToast('角色卡已刪除');
  } catch (err) {
    showToast(`刪除失敗：${err.message}`);
  }
}

function renderCharacterList() {
  characterListEl.innerHTML = '';

  if (characters.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '尚未建立角色卡，點選下方按鈕新增一張。';
    characterListEl.appendChild(empty);
  }

  characters.forEach((character) => {
    const item = document.createElement('div');
    item.className = 'player-item' + (character.id === selectedCharacterId ? ' active' : '');
    item.textContent = `${character.name}＠${character.server}`;
    item.addEventListener('click', () => {
      selectedCharacterId = character.id;
      renderCharacterList();
      renderCharacterDetail();
    });
    characterListEl.appendChild(item);
  });

  renderCharacterDetail();
}

function renderCharacterDetail() {
  const character = characters.find((c) => c.id === selectedCharacterId);
  if (!character) {
    characterDetailEl.innerHTML = '<p class="muted-text">選擇左側角色卡查看詳細內容，或新增一張角色卡。</p>';
    return;
  }

  characterDetailEl.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'detail-header';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = character.name + '＠' + character.server;
  titleWrap.appendChild(title);
  header.appendChild(titleWrap);

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  const editButton = document.createElement('button');
  editButton.className = 'secondary-button';
  editButton.textContent = '編輯';
  editButton.addEventListener('click', () => openCharacterModal(character));
  const deleteButton = document.createElement('button');
  deleteButton.className = 'secondary-button';
  deleteButton.textContent = '刪除';
  deleteButton.addEventListener('click', () => deleteCharacter(character.id));
  actions.appendChild(editButton);
  actions.appendChild(deleteButton);
  header.appendChild(actions);

  characterDetailEl.appendChild(header);

  const notesHeader = document.createElement('h4');
  notesHeader.textContent = '備註';
  characterDetailEl.appendChild(notesHeader);

  const notes = document.createElement('p');
  notes.className = 'muted-text';
  notes.style.whiteSpace = 'pre-wrap';
  notes.textContent = character.notes || '（未填寫）';
  characterDetailEl.appendChild(notes);
}

function populateDungeonTypeSelect() {
  dungeonTypeInput.innerHTML = '<option value="" disabled selected>請選擇類型</option>';
  DUNGEON_TYPES.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.key;
    option.textContent = type.label;
    dungeonTypeInput.appendChild(option);
  });
}
populateDungeonTypeSelect();

function dungeonTypeLabel(key) {
  const type = DUNGEON_TYPES.find((t) => t.key === key);
  return type ? type.label : key;
}

function openDungeonModal(dungeon = null) {
  editingDungeonId = dungeon ? dungeon.id : null;
  dungeonModalTitle.textContent = dungeon ? '編輯副本' : '新增副本';
  dungeonTypeInput.value = dungeon ? dungeon.type : '';
  dungeonNameInput.value = dungeon ? dungeon.name : '';
  dungeonVersionInput.value = dungeon ? dungeon.version : '';
  dungeonAbbrInput.value = dungeon ? dungeon.abbr || '' : '';
  dungeonLevelInput.value = dungeon ? dungeon.levelRequirement : '';
  dungeonIlvlInput.value = dungeon && dungeon.minItemLevel ? dungeon.minItemLevel : '';
  dungeonIlvlSyncInput.value = dungeon && dungeon.ilvlSync ? dungeon.ilvlSync : '';
  dungeonSizeInput.value = dungeon ? String(dungeon.maxParticipants) : '';
  dungeonModal.classList.remove('hidden');
}

function closeDungeonModal() {
  dungeonModal.classList.add('hidden');
  dungeonForm.reset();
  editingDungeonId = null;
}

addDungeonButton.addEventListener('click', () => openDungeonModal());
dungeonModalClose.addEventListener('click', closeDungeonModal);
dungeonCancel.addEventListener('click', closeDungeonModal);

dungeonForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUserIsAdmin) {
    showToast('只有管理員能新增或編輯副本');
    return;
  }

  const type = dungeonTypeInput.value;
  const name = dungeonNameInput.value.trim();
  const version = dungeonVersionInput.value.trim();
  const abbr = dungeonAbbrInput.value.trim();
  const levelRequirement = Number(dungeonLevelInput.value);
  const minItemLevel = dungeonIlvlInput.value ? Number(dungeonIlvlInput.value) : null;
  const ilvlSync = dungeonIlvlSyncInput.value ? Number(dungeonIlvlSyncInput.value) : null;
  const maxParticipants = Number(dungeonSizeInput.value);

  if (!type || !name || !version || !levelRequirement || !maxParticipants) {
    showToast('請填寫所有必填欄位');
    return;
  }

  try {
    if (editingDungeonId) {
      await updateDoc(doc(db, 'dungeons', editingDungeonId), {
        type,
        name,
        version,
        abbr,
        levelRequirement,
        minItemLevel,
        ilvlSync,
        maxParticipants,
        updatedAt: serverTimestamp()
      });
      showToast('副本已更新');
    } else {
      await addDoc(collection(db, 'dungeons'), {
        type,
        name,
        version,
        abbr,
        levelRequirement,
        minItemLevel,
        ilvlSync,
        maxParticipants,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      showToast('副本已建立');
    }
    closeDungeonModal();
  } catch (err) {
    showToast(`儲存失敗：${err.message}`);
  }
});

async function deleteDungeon(dungeonId) {
  if (!currentUserIsAdmin) return;
  if (!confirm('確定要刪除這個副本嗎？此動作無法復原。')) return;
  try {
    await deleteDoc(doc(db, 'dungeons', dungeonId));
    if (selectedDungeonId === dungeonId) selectedDungeonId = null;
    showToast('副本已刪除');
  } catch (err) {
    showToast(`刪除失敗：${err.message}`);
  }
}

function renderDungeonList() {
  dungeonListEl.innerHTML = '';

  if (dungeons.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = currentUserIsAdmin ? '尚未建立副本，點選下方按鈕新增一個。' : '目前還沒有副本資料。';
    dungeonListEl.appendChild(empty);
  }

  dungeons.forEach((dungeon) => {
    const item = document.createElement('div');
    item.className = 'player-item' + (dungeon.id === selectedDungeonId ? ' active' : '');
    item.textContent = `${dungeon.name}（${dungeon.version}）`;
    item.addEventListener('click', () => {
      selectedDungeonId = dungeon.id;
      renderDungeonList();
      renderDungeonDetail();
    });
    dungeonListEl.appendChild(item);
  });

  renderDungeonDetail();
}

function renderDungeonDetail() {
  const dungeon = dungeons.find((d) => d.id === selectedDungeonId);
  if (!dungeon) {
    dungeonDetailEl.innerHTML = '<p class="muted-text">選擇左側副本查看詳細內容。</p>';
    return;
  }

  dungeonDetailEl.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'detail-header';

  const titleWrap = document.createElement('div');
  titleWrap.style.display = 'flex';
  titleWrap.style.alignItems = 'center';
  titleWrap.style.gap = '10px';

  const icon = document.createElement('img');
  icon.src = DUNGEON_ICON_PATH(dungeon.type);
  icon.alt = dungeonTypeLabel(dungeon.type);
  icon.width = 40;
  icon.height = 40;
  titleWrap.appendChild(icon);

  const nameWrap = document.createElement('div');
  const title = document.createElement('h2');
  title.style.marginBottom = '5px';
  title.textContent = dungeon.name;
  const version = document.createElement('span');
  version.className = 'muted-text';
  version.textContent = `${dungeon.version}`;
  nameWrap.appendChild(title);
  nameWrap.appendChild(version);
  const abbr = document.createElement('span');
  if (dungeon.abbr) {
    abbr.className = 'muted-text';
    abbr.textContent = `（${dungeon.abbr}）`;
    title.appendChild(abbr);
  }
  titleWrap.appendChild(nameWrap);

  header.appendChild(titleWrap);

  if (currentUserIsAdmin) {
    const actions = document.createElement('div');
    actions.className = 'form-actions';
    const editButton = document.createElement('button');
    editButton.className = 'secondary-button';
    editButton.textContent = '編輯';
    editButton.addEventListener('click', () => openDungeonModal(dungeon));
    const deleteButton = document.createElement('button');
    deleteButton.className = 'secondary-button';
    deleteButton.textContent = '刪除';
    deleteButton.addEventListener('click', () => deleteDungeon(dungeon.id));
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    header.appendChild(actions);
  }

  dungeonDetailEl.appendChild(header);

  const info = document.createElement('div');
  info.className = 'detail-info';

  const rows = [
    ['需求等級', dungeon.levelRequirement],
    ['最低裝備品級', dungeon.minItemLevel || '無'],
    ['品級同步', dungeon.ilvlSync || '無'],
    ['所需人數', `${dungeon.maxParticipants} 人`]
  ];
  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'info-row';
    const labelEl = document.createElement('span');
    labelEl.className = 'muted-text';
    labelEl.textContent = label;
    const valueEl = document.createElement('span');
    valueEl.textContent = value;
    row.appendChild(labelEl);
    row.appendChild(valueEl);
    info.appendChild(row);
  });

  dungeonDetailEl.appendChild(info);
}

function subscribeDungeons() {
  if (unsubscribeDungeons) unsubscribeDungeons();
  unsubscribeDungeons = onSnapshot(
    collection(db, 'dungeons'),
    (snapshot) => {
      dungeons = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderDungeonList();
    },
    (err) => showToast(`讀取副本資料失敗：${err.message}`)
  );
}

function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysToDateStr(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return formatDateLocal(d);
}

// dailyTimeRange may cross midnight (e.g. 20:00 ~ 03:00): each date in dateRange is
// treated as a session's start date, and slots past midnight roll onto the next
// calendar date while staying grouped under the same session (see sessionDate/dayOffset).
function generateTimeSlots(dateRange, dailyTimeRange, slotMinutes) {
  const slots = [];
  const start = new Date(`${dateRange.start}T00:00:00`);
  const end = new Date(`${dateRange.end}T00:00:00`);
  const [startH, startM] = dailyTimeRange.start.split(':').map(Number);
  const [endH, endM] = dailyTimeRange.end.split(':').map(Number);
  const dailyStartMinutes = startH * 60 + startM;
  let dailyEndMinutes = endH * 60 + endM;
  if (dailyEndMinutes <= dailyStartMinutes) dailyEndMinutes += 24 * 60;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const sessionDate = formatDateLocal(d);
    for (let cur = dailyStartMinutes; cur < dailyEndMinutes; cur += slotMinutes) {
      const dayOffset = Math.floor(cur / (24 * 60));
      const minutesInDay = cur % (24 * 60);
      const slotDate = dayOffset === 0 ? sessionDate : addDaysToDateStr(sessionDate, dayOffset);
      const startTime = minutesToHHMM(minutesInDay);
      const endTime = minutesToHHMM((cur + slotMinutes) % (24 * 60));
      slots.push({ slotId: `${slotDate}_${startTime}`, date: slotDate, startTime, endTime, sessionDate, dayOffset });
    }
  }
  return slots;
}

function dungeonById(dungeonId) {
  return dungeons.find((d) => d.id === dungeonId);
}

function jobRole(jobKey) {
  const job = JOBS.find((j) => j.key === jobKey);
  return job ? job.category : null;
}

// Two-round greedy match (primary job, then backup jobs) plus a free-slot fill pass,
// per the matching rule documented in docs/data-model.md.
function computeSlotStatus(slotId, composition, responseList) {
  const buckets = { T: composition.T, H: composition.H, D: composition.D, FREE: composition.FREE };
  const total = buckets.T + buckets.H + buckets.D + buckets.FREE;

  const available = responseList.filter((r) => r.availability && r.availability[slotId] === 'available');
  if (total === 0) {
    return { total: 0, remaining: 0, status: 'none', assignedCount: available.length };
  }

  const roundTwoQueue = [];
  available.forEach((r) => {
    const role = jobRole((r.jobPriority || [])[0]);
    if (role && buckets[role] > 0) {
      buckets[role]--;
    } else {
      roundTwoQueue.push(r);
    }
  });

  const freeFillQueue = [];
  roundTwoQueue.forEach((r) => {
    const priority = r.jobPriority || [];
    let assigned = false;
    for (let i = 1; i < priority.length; i++) {
      const role = jobRole(priority[i]);
      if (role && buckets[role] > 0) {
        buckets[role]--;
        assigned = true;
        break;
      }
    }
    if (!assigned) freeFillQueue.push(r);
  });

  freeFillQueue.forEach(() => {
    if (buckets.FREE > 0) buckets.FREE--;
  });

  const remaining = buckets.T + buckets.H + buckets.D + buckets.FREE;
  let status = 'none';
  if (remaining === 0) status = 'complete';
  else if (remaining <= 2) status = 'potential';

  return { total, remaining, status, assignedCount: available.length };
}

function populateRecruitmentDungeonSelect() {
  recruitmentDungeonInput.innerHTML = '<option value="" disabled selected>請選擇副本</option>';
  dungeons.forEach((dungeon) => {
    const option = document.createElement('option');
    option.value = dungeon.id;
    option.textContent = `${dungeon.name}（${dungeon.version}）`;
    recruitmentDungeonInput.appendChild(option);
  });
}

function openRecruitmentModal(recruitment = null) {
  if (!recruitment && characters.length === 0) {
    showToast('請先建立角色卡才能建立招募');
    return;
  }
  editingRecruitmentId = recruitment ? recruitment.id : null;
  recruitmentModalTitle.textContent = recruitment ? '編輯招募' : '建立招募';
  populateRecruitmentDungeonSelect();
  recruitmentDungeonInput.value = recruitment ? recruitment.dungeonId : '';
  compTInput.value = recruitment ? recruitment.composition.T : 0;
  compHInput.value = recruitment ? recruitment.composition.H : 0;
  compDInput.value = recruitment ? recruitment.composition.D : 0;
  compFreeInput.value = recruitment ? recruitment.composition.FREE : 0;
  recruitmentIlvlInput.value = recruitment && recruitment.itemLevelRequirement ? recruitment.itemLevelRequirement : '';
  ruleUnrestrictedInput.checked = recruitment ? recruitment.specialRules.unrestricted : false;
  ruleEchoDisabledInput.checked = recruitment ? recruitment.specialRules.echoDisabled : false;
  ruleMinIlvlInput.checked = recruitment ? recruitment.specialRules.minItemLevelRule : false;
  ruleLevelSyncInput.checked = recruitment ? recruitment.specialRules.levelSync : false;
  recruitmentDateStartInput.value = recruitment ? recruitment.dateRange.start : '';
  recruitmentDateEndInput.value = recruitment ? recruitment.dateRange.end : '';
  recruitmentTimeStartInput.value = recruitment ? recruitment.dailyTimeRange.start : '';
  recruitmentTimeEndInput.value = recruitment ? recruitment.dailyTimeRange.end : '';
  recruitmentNotesInput.value = recruitment ? recruitment.notes || '' : '';
  recruitmentModal.classList.remove('hidden');
}

function closeRecruitmentModal() {
  recruitmentModal.classList.add('hidden');
  recruitmentForm.reset();
  editingRecruitmentId = null;
}

addRecruitmentButton.addEventListener('click', () => openRecruitmentModal());
recruitmentModalClose.addEventListener('click', closeRecruitmentModal);
recruitmentCancel.addEventListener('click', closeRecruitmentModal);

recruitmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const dungeonId = recruitmentDungeonInput.value;
  const dungeon = dungeonById(dungeonId);
  if (!dungeon) {
    showToast('請選擇目標副本');
    return;
  }

  const composition = {
    T: Number(compTInput.value) || 0,
    H: Number(compHInput.value) || 0,
    D: Number(compDInput.value) || 0,
    FREE: Number(compFreeInput.value) || 0
  };
  const itemLevelRequirement = recruitmentIlvlInput.value ? Number(recruitmentIlvlInput.value) : null;
  const specialRules = {
    unrestricted: ruleUnrestrictedInput.checked,
    echoDisabled: ruleEchoDisabledInput.checked,
    minItemLevelRule: ruleMinIlvlInput.checked,
    levelSync: ruleLevelSyncInput.checked
  };

  const compositionTotal = composition.T + composition.H + composition.D + composition.FREE;
  if (!specialRules.unrestricted && compositionTotal !== dungeon.maxParticipants) {
    showToast(`陣容總人數需等於副本所需人數（${dungeon.maxParticipants} 人），或勾選「解除限制」`);
    return;
  }

  const dateRange = { start: recruitmentDateStartInput.value, end: recruitmentDateEndInput.value };
  const dailyTimeRange = { start: recruitmentTimeStartInput.value, end: recruitmentTimeEndInput.value };
  const notes = recruitmentNotesInput.value.trim();

  if (!dateRange.start || !dateRange.end || dateRange.start > dateRange.end) {
    showToast('請填寫正確的日期區間');
    return;
  }
  if (!dailyTimeRange.start || !dailyTimeRange.end || dailyTimeRange.start === dailyTimeRange.end) {
    showToast('請填寫正確的每日時段（開始與結束時間不可相同；若跨日，結束時間可以早於開始時間，例如 20:00~03:00）');
    return;
  }

  const slotMinutes = 30;
  const timeSlots = generateTimeSlots(dateRange, dailyTimeRange, slotMinutes);

  try {
    if (editingRecruitmentId) {
      await updateDoc(doc(db, 'recruitments', editingRecruitmentId), {
        dungeonId,
        composition,
        itemLevelRequirement,
        specialRules,
        dateRange,
        dailyTimeRange,
        slotMinutes,
        timeSlots,
        notes,
        updatedAt: serverTimestamp()
      });
      showToast('招募已更新');
    } else {
      await addDoc(collection(db, 'recruitments'), {
        dungeonId,
        creatorId: currentUser.uid,
        composition,
        itemLevelRequirement,
        specialRules,
        dateRange,
        dailyTimeRange,
        slotMinutes,
        timeSlots,
        notes,
        status: 'recruiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      showToast('招募已建立');
    }
    closeRecruitmentModal();
  } catch (err) {
    showToast(`儲存失敗：${err.message}`);
  }
});

async function deleteRecruitment(recruitmentId) {
  if (!confirm('確定要刪除這個招募嗎？此動作無法復原。')) return;
  try {
    await deleteDoc(doc(db, 'recruitments', recruitmentId));
    if (selectedRecruitmentId === recruitmentId) selectedRecruitmentId = null;
    showToast('招募已刪除');
  } catch (err) {
    showToast(`刪除失敗：${err.message}`);
  }
}

async function setRecruitmentStatus(recruitmentId, status) {
  try {
    await updateDoc(doc(db, 'recruitments', recruitmentId), { status, updatedAt: serverTimestamp() });
  } catch (err) {
    showToast(`更新狀態失敗：${err.message}`);
  }
}

function renderRecruitmentList() {
  recruitmentListEl.innerHTML = '';

  if (recruitments.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '目前還沒有招募，點選下方按鈕建立一個。';
    recruitmentListEl.appendChild(empty);
  }

  recruitments.forEach((recruitment) => {
    const dungeon = dungeonById(recruitment.dungeonId);
    const item = document.createElement('div');
    item.className = 'player-item' + (recruitment.id === selectedRecruitmentId ? ' active' : '');
    const statusLabel = RECRUITMENT_STATUS_LABELS[recruitment.status] || recruitment.status;
    item.textContent = `${dungeon ? dungeon.name : '（副本已刪除）'} · ${statusLabel}`;
    item.addEventListener('click', () => selectRecruitment(recruitment.id));
    recruitmentListEl.appendChild(item);
  });

  renderRecruitmentDetail();
}

function selectRecruitment(recruitmentId) {
  if (selectedRecruitmentId === recruitmentId) return;
  selectedRecruitmentId = recruitmentId;
  selectedSlotId = null;
  isRespondingToRecruitment = false;
  slotRoleActiveOverride = {};
  subscribeResponses(recruitmentId);
  renderRecruitmentList();
  renderRecruitmentDetail();
}

function subscribeResponses(recruitmentId) {
  if (unsubscribeResponses) unsubscribeResponses();
  unsubscribeResponses = onSnapshot(
    collection(db, 'recruitments', recruitmentId, 'responses'),
    (snapshot) => {
      responses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (draftRecruitmentId !== recruitmentId) {
        const mine = responses.find((r) => r.id === currentUser.uid);
        draftCharacterId = mine ? mine.characterId : characters[0] ? characters[0].id : '';
        draftJobPriority = mine && mine.jobPriority ? [...mine.jobPriority] : [];
        draftAvailability = mine && mine.availability ? { ...mine.availability } : {};
        draftRecruitmentId = recruitmentId;
      }
      renderRecruitmentDetail();
    },
    (err) => showToast(`讀取回應資料失敗：${err.message}`)
  );
}

async function saveMyResponse(recruitmentId, patch) {
  try {
    // Full overwrite, not merge: `patch.availability` is always the complete desired
    // map, and Firestore's merge:true deep-merges nested maps instead of replacing
    // them — so a slot the user cleared locally would never actually get deleted and
    // would silently reappear after reloading. We always pass every meaningful field
    // together here, so there's nothing merge would have protected anyway.
    await setDoc(doc(db, 'recruitments', recruitmentId, 'responses', currentUser.uid), {
      uid: currentUser.uid,
      updatedAt: serverTimestamp(),
      ...patch
    });
  } catch (err) {
    showToast(`儲存回應失敗：${err.message}`);
  }
}

function renderRecruitmentDetail() {
  const recruitment = recruitments.find((r) => r.id === selectedRecruitmentId);
  if (!recruitment) {
    recruitmentDetailEl.innerHTML = '<p class="muted-text">選擇左側招募查看詳細內容。</p>';
    return;
  }

  const dungeon = dungeonById(recruitment.dungeonId);
  recruitmentDetailEl.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'detail-header';

  const titleWrap = document.createElement('div');
  titleWrap.style.display = 'flex';
  titleWrap.style.alignItems = 'center';
  titleWrap.style.gap = '10px';

  const statusLine = document.createElement('span');
  statusLine.className = 'status-badge';
  statusLine.textContent = RECRUITMENT_STATUS_LABELS[recruitment.status] || recruitment.status;
  titleWrap.appendChild(statusLine);

  const icon = document.createElement('img');
  icon.src = DUNGEON_ICON_PATH(dungeon.type);
  icon.alt = dungeonTypeLabel(dungeon.type);
  icon.width = 40;
  icon.height = 40;
  titleWrap.appendChild(icon);

  const nameWrap = document.createElement('div');
  const title = document.createElement('h2');
  title.style.marginBottom = '5px';
  title.textContent = dungeon ? `${dungeon.name}（${dungeon.version}）` : '（副本已刪除）';

  const version = document.createElement('span');
  version.className = 'muted-text';
  version.textContent = `${dungeon.version}`;
  nameWrap.appendChild(title);
  nameWrap.appendChild(version);
  
  const abbr = document.createElement('span');
  if (dungeon.abbr) {
    abbr.className = 'muted-text';
    abbr.textContent = `（${dungeon.abbr}）`;
    title.appendChild(abbr);
  }

  titleWrap.appendChild(nameWrap);
  header.appendChild(titleWrap);

  const isCreator = currentUser && recruitment.creatorId === currentUser.uid;
  const isDisbanded = recruitment.status === 'disbanded';
  if (isCreator) {
    const actions = document.createElement('div');
    actions.className = 'form-actions';
    if (!isDisbanded) {
      const editButton = document.createElement('button');
      editButton.className = 'secondary-button';
      editButton.textContent = '編輯';
      editButton.addEventListener('click', () => openRecruitmentModal(recruitment));
      actions.appendChild(editButton);
    }
    const deleteButton = document.createElement('button');
    deleteButton.className = 'secondary-button';
    deleteButton.textContent = '刪除';
    deleteButton.addEventListener('click', () => deleteRecruitment(recruitment.id));
    actions.appendChild(deleteButton);
    header.appendChild(actions);
  }

  recruitmentDetailEl.appendChild(header);

  if (isCreator && !isDisbanded) {
    const statusActions = document.createElement('div');
    statusActions.className = 'form-actions';
    statusActions.style.marginTop = '12px';
    [
      ['recruiting', '開放招募'],
      ['paused', '暫停招募'],
      ['full', '滿團出發'],
      ['disbanded', '流團']
    ].forEach(([status, label]) => {
      const button = document.createElement('button');
      button.className = 'secondary-button';
      button.textContent = label;
      button.disabled = recruitment.status === status;
      button.addEventListener('click', () => {
        if (status === 'disbanded') {
          if (!confirm('確定要將這個招募設為流團嗎？流團後就無法再編輯或變更狀態。')) return;
        }
        setRecruitmentStatus(recruitment.id, status);
      });
      statusActions.appendChild(button);
    });
    recruitmentDetailEl.appendChild(statusActions);
  } else if (isCreator && isDisbanded) {
    const note = document.createElement('p');
    note.className = 'muted-text';
    note.style.marginTop = '12px';
    note.textContent = '此招募已流團，無法再編輯或變更狀態。';
    recruitmentDetailEl.appendChild(note);
  }

  const compositionLabel = document.createElement('p');
  compositionLabel.className = 'muted-text';
  compositionLabel.style.margin = '16px 0 6px';
  compositionLabel.textContent = '所需陣容';
  recruitmentDetailEl.appendChild(compositionLabel);

  const compositionRow = document.createElement('div');
  compositionRow.style.display = 'flex';
  compositionRow.style.flexWrap = 'wrap';

  const compositionEntries = [
    ['T', recruitment.composition.T],
    ['H', recruitment.composition.H],
    ['D', recruitment.composition.D],
    ['FREE', recruitment.composition.FREE]
  ].filter(([, count]) => count > 0);

  if (compositionEntries.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'muted-text';
    empty.textContent = '未指定陣容需求';
    compositionRow.appendChild(empty);
  } else {
    compositionEntries.forEach(([roleKey, count]) => {
      const group = document.createElement('span');
      group.style.display = 'flex';
      group.style.alignItems = 'center';

      for (let i = 0; i < count; i++) {
        const icon = document.createElement('img');
        icon.src = ROLE_ICON_PATH(roleKey);
        icon.alt = roleKey;
        icon.width = 28;
        icon.height = 28;
        group.appendChild(icon);
      }

      compositionRow.appendChild(group);
    });
  }

  recruitmentDetailEl.appendChild(compositionRow);

  const info = document.createElement('div');
  info.className = 'detail-info';
  info.style.marginTop = '16px';

  const activeRules = [];
  if (recruitment.specialRules.unrestricted) activeRules.push('解除限制');
  if (recruitment.specialRules.echoDisabled) activeRules.push('超越之力無效化');
  if (recruitment.specialRules.minItemLevelRule) activeRules.push('最低品級');
  if (recruitment.specialRules.levelSync) activeRules.push('等級同步');

  const rows = [
    ['品級要求', recruitment.itemLevelRequirement || '無'],
    ['特殊規則', activeRules.length ? activeRules.join('、') : '無'],
    ['預計出團日期', `${recruitment.dateRange.start} ~ ${recruitment.dateRange.end}`],
    ['預計時段', `${recruitment.dailyTimeRange.start} ~ ${recruitment.dailyTimeRange.end}`]
  ];
  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'info-row';
    const labelEl = document.createElement('span');
    labelEl.className = 'muted-text';
    labelEl.textContent = label;
    const valueEl = document.createElement('span');
    valueEl.textContent = value;
    row.appendChild(labelEl);
    row.appendChild(valueEl);
    info.appendChild(row);
  });

  recruitmentDetailEl.appendChild(info);

  if (recruitment.notes) {
    const notesHeader = document.createElement('h4');
    notesHeader.textContent = '備註';
    recruitmentDetailEl.appendChild(notesHeader);

    const notes = document.createElement('p');
    notes.className = 'muted-text';
    notes.style.whiteSpace = 'pre-wrap';
    notes.textContent = recruitment.notes;
    recruitmentDetailEl.appendChild(notes);
  }

  if (isCreator) {
    renderResponderList(recruitmentDetailEl, recruitment);
  }

  const canRespond = recruitment.status === 'recruiting';

  if (dungeon) {
    if (!canRespond) {
      const note = document.createElement('p');
      note.className = 'muted-text';
      note.style.marginTop = '20px';
      note.textContent = `此招募目前狀態為「${RECRUITMENT_STATUS_LABELS[recruitment.status] || recruitment.status}」，無法回應。`;
      recruitmentDetailEl.appendChild(note);
    } else if (isRespondingToRecruitment) {
      renderResponseForm(recruitmentDetailEl, recruitment);
    } else if (characters.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted-text';
      empty.style.marginTop = '20px';
      empty.textContent = '請先建立角色卡才能回應這個招募。';
      recruitmentDetailEl.appendChild(empty);
    } else {
      const hasResponded = responses.some((r) => r.id === currentUser.uid);
      const respondButton = document.createElement('button');
      respondButton.type = 'button';
      respondButton.className = 'primary-button';
      respondButton.style.marginTop = '20px';
      respondButton.textContent = hasResponded ? '修改響應內容' : '響應招募';
      respondButton.addEventListener('click', () => {
        isRespondingToRecruitment = true;
        renderRecruitmentDetail();
      });
      recruitmentDetailEl.appendChild(respondButton);
    }
    renderSlotTable(recruitmentDetailEl, recruitment, dungeon);
  }
}

async function removeResponseAsCreator(recruitmentId, uid) {
  try {
    await deleteDoc(doc(db, 'recruitments', recruitmentId, 'responses', uid));
    showToast('已移除該回應');
  } catch (err) {
    showToast(`移除失敗：${err.message}`);
  }
}

function renderResponderList(container, recruitment) {
  const section = document.createElement('div');
  section.className = 'card-form';
  section.style.marginTop = '20px';

  const heading = document.createElement('h4');
  heading.style.marginTop = '0';
  heading.textContent = `回應名單（${responses.length} 人）`;
  section.appendChild(heading);

  if (responses.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '目前還沒有人回應。';
    section.appendChild(empty);
  } else {
    const list = document.createElement('div');
    list.className = 'player-list';
    responses.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'player-item responder-item';

      const info = document.createElement('span');
      const jobNames = (r.jobPriority || [])
        .map((k) => (JOBS.find((j) => j.key === k) || {}).name || k)
        .join('/');
      const slotCount = r.availability ? Object.keys(r.availability).length : 0;
      info.textContent = `${r.characterName || '未知角色'}＠${r.characterServer || '?'}（${jobNames || '未選職業'}）· ${slotCount} 個時段`;
      row.appendChild(info);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'secondary-button';
      removeButton.textContent = '移除';
      removeButton.addEventListener('click', () => {
        if (!confirm(`確定要移除「${r.characterName || '這位玩家'}」的回應嗎？`)) return;
        removeResponseAsCreator(recruitment.id, r.id);
      });
      row.appendChild(removeButton);

      list.appendChild(row);
    });
    section.appendChild(list);
  }

  container.appendChild(section);
}

function renderResponseForm(container, recruitment) {
  const section = document.createElement('div');
  section.className = 'card-form';
  section.style.marginTop = '20px';

  const heading = document.createElement('h4');
  heading.textContent = '我的回應';
  section.appendChild(heading);

  if (characters.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = '請先建立角色卡才能回應這個招募。';
    section.appendChild(empty);
    container.appendChild(section);
    return;
  }

  if (!draftCharacterId) draftCharacterId = characters[0].id;

  const charLabel = document.createElement('label');
  charLabel.textContent = '使用角色';
  const charSelect = document.createElement('select');
  characters.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name}＠${c.server}`;
    if (c.id === draftCharacterId) opt.selected = true;
    charSelect.appendChild(opt);
  });
  charSelect.addEventListener('change', () => {
    draftCharacterId = charSelect.value;
    draftJobPriority = [];
    draftAvailability = {};
    selectedSlotId = null;
    renderRecruitmentDetail();
  });
  charLabel.appendChild(charSelect);
  section.appendChild(charLabel);

  const jobsLabel = document.createElement('p');
  jobsLabel.className = 'muted-text';
  jobsLabel.style.margin = '10px 0 6px';
  jobsLabel.textContent = '選擇職業（勾選順序＝優先度，第一個為主要職業）';
  section.appendChild(jobsLabel);

  JOB_GROUPS.forEach((group) => {
    const jobsInGroup = JOBS.filter((job) => job.group === group.key);
    if (jobsInGroup.length === 0) return;

    const groupHeading = document.createElement('p');
    groupHeading.className = 'muted-text';
    groupHeading.style.margin = '10px 0 4px';
    groupHeading.style.fontWeight = 'bold';
    groupHeading.textContent = group.label;
    section.appendChild(groupHeading);

    const checklist = document.createElement('div');
    checklist.className = 'checkbox-grid';
    jobsInGroup.forEach((job) => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = draftJobPriority.includes(job.key);

      const icon = document.createElement('img');
      icon.src = JOB_ICON_PATH(job.key);
      icon.width = 20;
      icon.height = 20;

      const text = document.createElement('span');
      const priorityIndex = draftJobPriority.indexOf(job.key);
      text.textContent = priorityIndex >= 0 ? `${job.name}（優先 ${priorityIndex + 1}）` : job.name;

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          if (!draftJobPriority.includes(job.key)) draftJobPriority.push(job.key);
        } else {
          draftJobPriority = draftJobPriority.filter((k) => k !== job.key);
        }
        renderRecruitmentDetail();
      });

      label.appendChild(checkbox);
      label.appendChild(icon);
      label.appendChild(text);
      checklist.appendChild(label);
    });
    section.appendChild(checklist);
  });

  container.appendChild(section);
}

// Appends one small icon per job key (with the job name as a hover title) to `container`;
// falls back to a muted "未選職業" label if there are no jobs to show.
function appendJobIcons(container, jobKeys) {
  if (!jobKeys || jobKeys.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'muted-text';
    empty.textContent = '未選職業';
    container.appendChild(empty);
    return;
  }
  jobKeys.forEach((key) => {
    const job = JOBS.find((j) => j.key === key);
    const icon = document.createElement('img');
    icon.src = JOB_ICON_PATH(key);
    icon.alt = job ? job.name : key;
    icon.title = job ? job.name : key;
    icon.className = 'chip-job-icon';
    icon.width = 20;
    icon.height = 20;
    container.appendChild(icon);
  });
}

// entries: [{ response, jobKeys }]. Clicking a chip shows that character's notes — used
// for the 主選／自由 cells, where the person is already "confirmed" in that role.
function renderNoteChips(entries) {
  const list = document.createElement('div');
  list.className = 'slot-summary';
  entries.forEach(({ response, jobKeys }) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip-button';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = response.characterName || '未知角色';
    chip.appendChild(nameSpan);
    appendJobIcons(chip, jobKeys);
    chip.addEventListener('click', () => showCharacterNote(response));
    list.appendChild(chip);
  });
  return list;
}

// entries: [{ response, jobKeys }]. Clicking a chip makes `roleKey` this responder's
// active role (moving them into that row's 主選 cell) — a pure front-end simulation,
// see `slotRoleActiveOverride`.
function renderBackupChips(entries, roleKey) {
  const list = document.createElement('div');
  list.className = 'slot-summary';
  entries.forEach(({ response, jobKeys }) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip-button chip-button-backup';
    chip.title = '模擬這個人改頂這個位置';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = response.characterName || '未知角色';
    chip.appendChild(nameSpan);
    appendJobIcons(chip, jobKeys);
    chip.addEventListener('click', () => {
      slotRoleActiveOverride[response.id] = roleKey;
      renderRecruitmentDetail();
    });
    list.appendChild(chip);
  });
  return list;
}

// Renders the "可參加" group for a time slot as a 主選／備選 table: one row per
// composition role (T/H/D), split into two columns. A responder's jobPriority[0]
// decides which role's 主選 column they start in by default; every other role they
// also have a job for shows them in that role's 備選 column instead. Clicking a 備選
// chip swaps that responder's active role (see `slotRoleActiveOverride`) so their old
// 主選 role becomes a 備選 elsewhere — purely a front-end "what if" simulation, never
// written to Firestore. The 自由 row (when the composition has free slots) isn't split
// since a free slot accepts any job — it just lists everyone with their full job
// priority. If the recruitment has no composition requirement at all, falls back to a
// flat chip list. Every 主選／自由 name is clickable to view that character's notes.
function renderAvailableRoleList(composition, availableGroup) {
  const wrap = document.createElement('div');
  wrap.className = 'slot-role-list';

  const hasComposition = composition.T > 0 || composition.H > 0 || composition.D > 0 || composition.FREE > 0;
  if (!hasComposition) {
    wrap.appendChild(
      renderNoteChips(availableGroup.map((r) => ({ response: r, jobKeys: r.jobPriority || [] })))
    );
    return wrap;
  }

  const table = document.createElement('table');
  table.className = 'slot-role-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th'));
  const mainTh = document.createElement('th');
  mainTh.textContent = '主選';
  const backupTh = document.createElement('th');
  backupTh.textContent = '備選';
  headRow.appendChild(mainTh);
  headRow.appendChild(backupTh);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  function roleIconCell(roleKey) {
    const td = document.createElement('td');
    td.className = 'slot-role-icon-cell';
    const icon = document.createElement('img');
    icon.src = ROLE_ICON_PATH(roleKey);
    icon.alt = roleKey;
    icon.width = 24;
    icon.height = 24;
    td.appendChild(icon);
    return td;
  }

  ['T', 'H', 'D'].forEach((roleKey) => {
    if (!composition[roleKey]) return;

    const candidates = availableGroup
      .map((r) => ({ response: r, jobKeys: (r.jobPriority || []).filter((k) => jobRole(k) === roleKey) }))
      .filter((c) => c.jobKeys.length > 0);

    const mainEntries = [];
    const backupEntries = [];
    candidates.forEach(({ response, jobKeys }) => {
      const defaultRole = jobRole((response.jobPriority || [])[0]);
      const activeRole = slotRoleActiveOverride[response.id] || defaultRole;
      const entry = { response, jobKeys };
      if (activeRole === roleKey) mainEntries.push(entry);
      else backupEntries.push(entry);
    });

    const tr = document.createElement('tr');
    tr.appendChild(roleIconCell(roleKey));

    const mainTd = document.createElement('td');
    if (mainEntries.length > 0) mainTd.appendChild(renderNoteChips(mainEntries));
    tr.appendChild(mainTd);

    const backupTd = document.createElement('td');
    if (backupEntries.length > 0) backupTd.appendChild(renderBackupChips(backupEntries, roleKey));
    tr.appendChild(backupTd);

    tbody.appendChild(tr);
  });

  if (composition.FREE > 0) {
    const tr = document.createElement('tr');
    tr.appendChild(roleIconCell('FREE'));

    const freeTd = document.createElement('td');
    freeTd.colSpan = 2;
    if (availableGroup.length > 0) {
      freeTd.appendChild(
        renderNoteChips(availableGroup.map((r) => ({ response: r, jobKeys: r.jobPriority || [] })))
      );
    }
    tr.appendChild(freeTd);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function openCharacterNoteModal(name, text) {
  characterNoteModalTitle.textContent = name;
  characterNoteModalText.textContent = text;
  characterNoteModal.classList.remove('hidden');
}

async function showCharacterNote(response) {
  openCharacterNoteModal(response.characterName || '未知角色', '載入中…');
  if (!response.characterId) {
    characterNoteModalText.textContent = '（找不到角色資料）';
    return;
  }
  try {
    const snap = await getDoc(doc(db, 'characters', response.characterId));
    const notes = snap.exists() ? (snap.data().notes || '').trim() : '';
    characterNoteModalText.textContent = notes || '（這個角色沒有填寫備註）';
  } catch (err) {
    characterNoteModalText.textContent = `讀取備註失敗：${err.message}`;
  }
}

characterNoteModalClose.addEventListener('click', () => characterNoteModal.classList.add('hidden'));

function renderSlotTable(container, recruitment, dungeon) {
  const respondingActive = recruitment.status === 'recruiting' && isRespondingToRecruitment;

  const section = document.createElement('div');
  section.className = 'time-slot-panel';

  const heading = document.createElement('h4');
  heading.textContent = '時段表';
  section.appendChild(heading);

  if (!respondingActive) {
    const responderCount = document.createElement('p');
    responderCount.className = 'muted-text';
    responderCount.textContent = `目前已有 ${responses.length} 人回應`;
    section.appendChild(responderCount);
  }

  const hint = document.createElement('p');
  hint.className = 'muted-text';
  hint.textContent = respondingActive
    ? '點選時段可查看詳情、並依序切換你的參加狀態（可參加／不確定／無法參加／清除），記得按「儲存我的回應」才會送出。綠色＝已可成團，黃色＝快滿了。'
    : '點選時段可查看該時段的詳情與名單。綠色＝已可成團，黃色＝快滿了；點上方「響應招募」即可設定你自己的參加狀態。';
  section.appendChild(hint);

  if (respondingActive) {
    const bulkActions = document.createElement('div');
    bulkActions.className = 'form-actions';
    bulkActions.style.marginBottom = '10px';

    const selectAllButton = document.createElement('button');
    selectAllButton.type = 'button';
    selectAllButton.className = 'secondary-button';
    selectAllButton.textContent = '一鍵全選（可參加）';
    selectAllButton.addEventListener('click', () => {
      recruitment.timeSlots.forEach((s) => {
        draftAvailability[s.slotId] = 'available';
      });
      renderRecruitmentDetail();
    });

    const clearAllButton = document.createElement('button');
    clearAllButton.type = 'button';
    clearAllButton.className = 'secondary-button';
    clearAllButton.textContent = '一鍵清除';
    clearAllButton.addEventListener('click', () => {
      draftAvailability = {};
      renderRecruitmentDetail();
    });

    bulkActions.appendChild(selectAllButton);
    bulkActions.appendChild(clearAllButton);
    section.appendChild(bulkActions);
  }

  // Slots carry sessionDate/dayOffset so an overnight range (e.g. 20:00~03:00) stays
  // grouped under the evening it started on, even though the actual date rolls over.
  // Older recruitments created before this existed fall back to per-date grouping.
  const sessionDates = [...new Set(recruitment.timeSlots.map((s) => s.sessionDate || s.date))];
  const firstSession = sessionDates[0];
  const columns = recruitment.timeSlots
    .filter((s) => (s.sessionDate || s.date) === firstSession)
    .map((s) => ({ startTime: s.startTime, dayOffset: s.dayOffset || 0 }));

  const tableWrap = document.createElement('div');
  tableWrap.className = 'detail-table';
  tableWrap.style.overflowX = 'auto';

  const table = document.createElement('table');
  table.className = 'slot-table';

  // Toggles every slot in `slotIds` to 'available', unless they're all already
  // 'available', in which case it clears them — same pattern as a header checkbox
  // that selects/deselects everything in its row or column.
  function toggleSlotGroup(slotIds) {
    const allChecked = slotIds.length > 0 && slotIds.every((id) => draftAvailability[id] === 'available');
    slotIds.forEach((id) => {
      if (allChecked) delete draftAvailability[id];
      else draftAvailability[id] = 'available';
    });
    renderRecruitmentDetail();
  }

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th'));
  columns.forEach((col, i) => {
    const th = document.createElement('th');
    th.textContent = col.startTime;
    if (i > 0 && col.dayOffset !== columns[i - 1].dayOffset) th.classList.add('day-boundary');
    if (respondingActive) {
      th.classList.add('header-toggle');
      th.title = '點選勾選/清除每天這個時段';
      th.addEventListener('click', () => {
        const slotIds = sessionDates
          .map((sd) =>
            recruitment.timeSlots.find(
              (s) => (s.sessionDate || s.date) === sd && s.startTime === col.startTime && (s.dayOffset || 0) === col.dayOffset
            )
          )
          .filter(Boolean)
          .map((s) => s.slotId);
        toggleSlotGroup(slotIds);
      });
    }
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  sessionDates.forEach((sessionDate) => {
    const tr = document.createElement('tr');
    const dateTh = document.createElement('th');
    dateTh.textContent = sessionDate.slice(5);
    if (respondingActive) {
      dateTh.classList.add('header-toggle');
      dateTh.title = '點選勾選/清除這一天的所有時段';
      dateTh.addEventListener('click', () => {
        const slotIds = recruitment.timeSlots
          .filter((s) => (s.sessionDate || s.date) === sessionDate)
          .map((s) => s.slotId);
        toggleSlotGroup(slotIds);
      });
    }
    tr.appendChild(dateTh);

    columns.forEach((col, i) => {
      const slot = recruitment.timeSlots.find(
        (s) => (s.sessionDate || s.date) === sessionDate && s.startTime === col.startTime && (s.dayOffset || 0) === col.dayOffset
      );
      const td = document.createElement('td');
      if (i > 0 && col.dayOffset !== columns[i - 1].dayOffset) td.classList.add('day-boundary');
      if (!slot) {
        tr.appendChild(td);
        return;
      }

      const result = computeSlotStatus(slot.slotId, recruitment.composition, responses);
      td.classList.add('slot-cell');
      if (result.status === 'complete') td.classList.add('status-complete');
      else if (result.status === 'potential') td.classList.add('status-potential');
      if (slot.slotId === selectedSlotId) td.classList.add('status-selected');

      if (respondingActive) {
        const myStatus = draftAvailability[slot.slotId];
        if (myStatus) {
          const marker = document.createElement('span');
          marker.className = `slot-mine-${myStatus}`;
          marker.textContent = myStatus === 'available' ? '✓' : myStatus === 'tentative' ? '？' : '×';
          td.appendChild(marker);
        }
      } else if (result.assignedCount > 0) {
        const countEl = document.createElement('span');
        countEl.className = 'slot-count';
        countEl.textContent = `${result.assignedCount}人`;
        td.appendChild(countEl);
      }

      td.addEventListener('click', () => {
        if (selectedSlotId !== slot.slotId) slotRoleActiveOverride = {};
        selectedSlotId = slot.slotId;
        if (respondingActive) {
          const order = [undefined, 'available', 'tentative', 'unavailable'];
          const idx = order.indexOf(draftAvailability[slot.slotId]);
          const next = order[(idx + 1) % order.length];
          if (next) draftAvailability[slot.slotId] = next;
          else delete draftAvailability[slot.slotId];
        }
        renderRecruitmentDetail();
      });

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tableWrap.appendChild(table);
  section.appendChild(tableWrap);

  if (selectedSlotId) {
    const slot = recruitment.timeSlots.find((s) => s.slotId === selectedSlotId);
    if (slot) {
      const detail = document.createElement('div');
      detail.className = 'card';
      detail.style.marginTop = '14px';

      const detailTitle = document.createElement('h4');
      detailTitle.style.marginTop = '0';
      detailTitle.textContent = `${slot.date} ${slot.startTime} ~ ${slot.endTime}`;
      detail.appendChild(detailTitle);

      const result = computeSlotStatus(selectedSlotId, recruitment.composition, responses);
      const summary = document.createElement('p');
      summary.className = 'muted-text';
      summary.textContent =
        result.total === 0
          ? '此招募未設定陣容需求'
          : `已響應 ${result.total - result.remaining} / ${result.total} 人`;
      detail.appendChild(summary);

      const availableGroup = responses.filter((r) => r.availability && r.availability[selectedSlotId] === 'available');
      if (availableGroup.length > 0) {
        const groupTitle = document.createElement('p');
        groupTitle.style.marginBottom = '4px';
        groupTitle.style.fontWeight = 'bold';
        groupTitle.textContent = AVAILABILITY_LABELS.available;
        detail.appendChild(groupTitle);
        detail.appendChild(renderAvailableRoleList(recruitment.composition, availableGroup));
      }

      ['tentative', 'unavailable'].forEach((statusKey) => {
        const group = responses.filter((r) => r.availability && r.availability[selectedSlotId] === statusKey);
        if (group.length === 0) return;

        const groupTitle = document.createElement('p');
        groupTitle.style.marginBottom = '4px';
        groupTitle.style.fontWeight = 'bold';
        groupTitle.textContent = AVAILABILITY_LABELS[statusKey];
        detail.appendChild(groupTitle);

        const list = document.createElement('div');
        list.className = 'slot-summary';
        group.forEach((r) => {
          const chip = document.createElement('span');
          const jobNames = (r.jobPriority || [])
            .map((k) => (JOBS.find((j) => j.key === k) || {}).name || k)
            .join('/');
          chip.textContent = `${r.characterName || '未知角色'}（${jobNames}）`;
          list.appendChild(chip);
        });
        detail.appendChild(list);
      });

      section.appendChild(detail);
    }
  }

  if (respondingActive) {
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'primary-button';
    saveButton.style.marginTop = '14px';
    saveButton.textContent = '儲存我的回應';
    saveButton.addEventListener('click', async () => {
      const hasExistingResponse = responses.some((r) => r.id === currentUser.uid);
      if (Object.keys(draftAvailability).length === 0) {
        if (!hasExistingResponse) {
          showToast('請至少選擇一個時段');
          return;
        }
        // Clearing every slot on an existing response removes them from the
        // responder count entirely, rather than leaving behind an empty response.
        try {
          await deleteDoc(doc(db, 'recruitments', recruitment.id, 'responses', currentUser.uid));
          showToast('已清除所有時段，回應已移除');
        } catch (err) {
          showToast(`移除回應失敗：${err.message}`);
          return;
        }
        isRespondingToRecruitment = false;
        renderRecruitmentDetail();
        return;
      }
      if (!draftCharacterId || draftJobPriority.length === 0) {
        showToast('請選擇角色並至少勾選一個職業');
        return;
      }
      const character = characters.find((c) => c.id === draftCharacterId);
      await saveMyResponse(recruitment.id, {
        characterId: draftCharacterId,
        characterName: character.name,
        characterServer: character.server,
        jobPriority: draftJobPriority,
        availability: draftAvailability
      });
      showToast('回應已儲存');
      isRespondingToRecruitment = false;
      renderRecruitmentDetail();
    });
    section.appendChild(saveButton);
  }

  container.appendChild(section);
}

function subscribeRecruitments() {
  if (unsubscribeRecruitments) unsubscribeRecruitments();
  unsubscribeRecruitments = onSnapshot(
    collection(db, 'recruitments'),
    (snapshot) => {
      recruitments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderRecruitmentList();
    },
    (err) => showToast(`讀取招募資料失敗：${err.message}`)
  );
}

function subscribeCharacters(uid) {
  if (unsubscribeCharacters) unsubscribeCharacters();
  const q = query(collection(db, 'characters'), where('ownerId', '==', uid));
  unsubscribeCharacters = onSnapshot(
    q,
    (snapshot) => {
      characters = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderCharacterList();
    },
    (err) => showToast(`讀取角色卡失敗：${err.message}`)
  );
}

async function ensureUserDoc(user) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName || '',
      email: user.email || '',
      isAdmin: false,
      createdAt: serverTimestamp()
    });
    return false;
  }
  await updateDoc(userRef, {
    displayName: user.displayName || '',
    email: user.email || ''
  });
  return snapshot.data().isAdmin === true;
}

loginButton.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    showToast(`登入失敗：${err.message}`);
  }
});

anonymousLoginButton.addEventListener('click', async () => {
  try {
    await signInAnonymously(auth);
  } catch (err) {
    showToast(`登入失敗：${err.message}`);
  }
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  renderAuthArea();

  if (user) {
    loginPanel.classList.remove('active-panel');
    loginPanel.classList.add('hidden');
    appNav.classList.remove('hidden');
    switchTab('characters-panel');
    try {
      currentUserIsAdmin = await ensureUserDoc(user);
    } catch (err) {
      currentUserIsAdmin = false;
      showToast(`初始化使用者資料失敗：${err.message}`);
    }
    addDungeonButton.classList.toggle('hidden', !currentUserIsAdmin);
    dungeonsTabButton.classList.toggle('hidden', !currentUserIsAdmin);
    subscribeCharacters(user.uid);
    subscribeDungeons();
    subscribeRecruitments();
  } else {
    appNav.classList.add('hidden');
    dungeonsTabButton.classList.add('hidden');
    dungeonsPanel.classList.remove('active-panel');
    dungeonsPanel.classList.add('hidden');
    recruitmentsPanel.classList.remove('active-panel');
    recruitmentsPanel.classList.add('hidden');
    charactersPanel.classList.remove('active-panel');
    charactersPanel.classList.add('hidden');
    loginPanel.classList.remove('hidden');
    loginPanel.classList.add('active-panel');
    if (unsubscribeCharacters) {
      unsubscribeCharacters();
      unsubscribeCharacters = null;
    }
    if (unsubscribeDungeons) {
      unsubscribeDungeons();
      unsubscribeDungeons = null;
    }
    if (unsubscribeRecruitments) {
      unsubscribeRecruitments();
      unsubscribeRecruitments = null;
    }
    if (unsubscribeResponses) {
      unsubscribeResponses();
      unsubscribeResponses = null;
    }
    currentUserIsAdmin = false;
    characters = [];
    selectedCharacterId = null;
    dungeons = [];
    selectedDungeonId = null;
    recruitments = [];
    selectedRecruitmentId = null;
    responses = [];
    selectedSlotId = null;
    isRespondingToRecruitment = false;
  }
});
