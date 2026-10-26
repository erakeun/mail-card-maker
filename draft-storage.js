// Versioned, local-only editing files. The previous app had no project-file format.
const DRAFT_VERSION = 1;
const DRAFT_DB = "mail-card-maker-drafts";
const DRAFT_FAST_KEY = "mail-card-maker-state-v1";
const DRAFT_TEXT_FIELDS = ["name", "title", "team", "work", "email", "phone", "address"];
const DRAFT_VALUE_FIELDS = ["logoType", "logoOffsetX", "logoOffsetY", "logoScale", "logoColor", "exportWidth", "imageMode", "category", "nameOffsetX", "nameOffsetY", "nameScale", "charOffsetX", "charOffsetY", "charScale", "photoShape", "photoOffsetX", "photoOffsetY", "photoScale"];
const DRAFT_CHECK_FIELDS = ["boldName", "boldTitle", "boldTeam", "boldWork", "boldContact", "boldAddress", "charFlip"];
let draftTimer = null;
let draftRestoring = false;
let draftGeneration = 0;
let draftWriteChain = Promise.resolve();
let draftTimestamp = 0;
const draftImageCache = new WeakMap();
const draftImageIds = new WeakMap();

function draftImageIdentity(image) {
  if (!image?.naturalWidth) return null;
  if (!draftImageIds.has(image)) draftImageIds.set(image, crypto.randomUUID());
  return draftImageIds.get(image);
}

function draftStatus(message) {
  document.getElementById("draftStatus").textContent = message;
}

function openDraftDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function draftDB(operation, value) {
  const database = await openDraftDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("drafts", operation === "get" ? "readonly" : "readwrite");
    const store = transaction.objectStore("drafts");
    const request = operation === "put" ? store.put(value, "current") : store[operation]("current");
    transaction.oncomplete = () => { database.close(); resolve(request.result); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
    transaction.onabort = () => { database.close(); reject(transaction.error); };
  });
}

function draftImageData(image) {
  if (!image?.naturalWidth) return Promise.resolve(null);
  if (draftImageCache.has(image)) return draftImageCache.get(image);
  const promise = fetch(image.src).then(response => response.blob()).then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  }));
  draftImageCache.set(image, promise);
  return promise;
}

async function captureDraft() {
  const state = JSON.parse(getEditorState());
  const updatedAt = draftTimestamp;
  const [photo, logo] = await Promise.all([draftImageData(uploadedPhotoImg), draftImageData(uploadedLogoImg)]);
  return { format: "mail-card-maker", schemaVersion: DRAFT_VERSION, updatedAt, state, uploads: { photo, logo } };
}

function scheduleDraftSave() {
  if (!appReady || draftRestoring) return;
  // The compact state is synchronous so even immediate tab closing keeps the
  // final dot/position/text edit. Larger upload bytes live in IndexedDB.
  draftTimestamp = Date.now();
  try {
    localStorage.setItem(DRAFT_FAST_KEY, JSON.stringify({ format: "mail-card-maker", schemaVersion: DRAFT_VERSION, updatedAt: draftTimestamp, state: JSON.parse(getEditorState()) }));
  } catch { /* IndexedDB still provides the normal save path. */ }
  clearTimeout(draftTimer);
  const generation = ++draftGeneration;
  draftStatus("이 기기에 저장 중…");
  draftTimer = setTimeout(() => {
    const snapshot = captureDraft();
    draftWriteChain = draftWriteChain.catch(() => {}).then(async () => {
      const draft = await snapshot;
      if (generation !== draftGeneration) return;
      await draftDB("put", draft);
      if (generation === draftGeneration) draftStatus("이 기기에 자동 저장됨 · 다음에 열면 복원돼.");
    }).catch(() => draftStatus("이 기기 자동 저장을 사용할 수 없어. 편집파일 저장으로 보관해줘."));
  }, 300);
}

function clearLocalDraft() {
  ++draftGeneration;
  clearTimeout(draftTimer);
  try { localStorage.removeItem(DRAFT_FAST_KEY); } catch { /* Storage can be disabled. */ }
  draftWriteChain = draftWriteChain.catch(() => {}).then(() => draftDB("delete")).catch(() => {});
}

function validateDraft(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("편집파일 형식을 확인해줘.");
  if (raw.format && raw.format !== "mail-card-maker") throw new Error("메일 명함 편집파일만 열 수 있어.");
  if (raw.schemaVersion !== undefined && raw.schemaVersion !== DRAFT_VERSION) throw new Error("지원하지 않는 편집파일 버전이야.");
  // An unwrapped legacy editor state is also accepted; new fields get defaults.
  const source = raw.state || raw;
  if (!source || typeof source !== "object" || Array.isArray(source) || typeof source.name !== "string") throw new Error("명함 편집 내용이 없는 파일이야.");
  const defaults = JSON.parse(defaultEditorState);
  const state = { ...defaults };
  for (const key of ["photoRevision", "logoRevision"]) {
    if (typeof source[key] === "string" && source[key].length < 100) state[key] = source[key];
  }
  for (const key of DRAFT_TEXT_FIELDS) {
    if (typeof source[key] === "string") state[key] = source[key].slice(0, 10000);
  }
  for (const key of DRAFT_VALUE_FIELDS) {
    const control = document.getElementById(key);
    const value = source[key];
    if (control.tagName === "SELECT") {
      if ([...control.options].some(option => option.value === value)) state[key] = value;
    } else if ((typeof value === "string" || typeof value === "number") && value !== "" && Number.isFinite(Number(value))) {
      state[key] = String(Math.min(Number(control.max), Math.max(Number(control.min), Number(value))));
    }
  }
  for (const key of DRAFT_CHECK_FIELDS) if (typeof source[key] === "boolean") state[key] = source[key];
  if (typeof source.templateId === "string" && Object.hasOwn(CARD_TEMPLATES, source.templateId)) state.templateId = source.templateId;
  if (source.character === "" || characters.some(character => character.file === source.character)) state.character = source.character;
  const character = characters.find(item => item.file === state.character);
  if (character && state.category !== "all" && state.category !== character.category) state.category = character.category;
  const uploads = { photo: null, logo: null };
  for (const key of Object.keys(uploads)) {
    const value = raw.uploads?.[key];
    if (value == null) continue;
    if (typeof value !== "string" || value.length > 29 * 1024 * 1024 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) throw new Error("편집파일의 이미지 형식이나 크기를 확인해줘.");
    uploads[key] = value;
  }
  return { state, uploads };
}

async function applyDraft(raw) {
  const { state, uploads } = validateDraft(raw);
  draftRestoring = true;
  const panel = document.querySelector(".panel");
  panel.inert = true;
  panel.setAttribute("aria-busy", "true");
  ++draftGeneration;
  clearTimeout(draftTimer);
  try {
    // Decode every embedded image before altering the current work.
    const [photo, logo] = await Promise.all([uploads.photo ? loadImage(uploads.photo) : null, uploads.logo ? loadImage(uploads.logo) : null])
      .catch(() => { throw new Error("편집파일의 이미지를 읽지 못했어."); });
    clearUploadedPhoto();
    clearUploadedLogo();
    for (const key of [...DRAFT_TEXT_FIELDS, ...DRAFT_VALUE_FIELDS]) document.getElementById(key).value = state[key];
    for (const key of DRAFT_CHECK_FIELDS) document.getElementById(key).checked = state[key] || false;
    refreshCharacterOptions(state.character);
    uploadedPhotoImg = photo;
    uploadedLogoImg = logo;
    if (photo && state.photoRevision) draftImageIds.set(photo, state.photoRevision);
    if (logo && state.logoRevision) draftImageIds.set(logo, state.logoRevision);
    if (photo) elPhotoPreview.src = photo.src;
    if (logo) elLogoUploadStatus.textContent = "편집파일의 로고가 복원됐어.";
    updateLogoUI();
    updateImageModeUI();
    updateRangeLabels();
    await Promise.all([selectTemplate(state.templateId), updateCharacterAndDraw()]);
  } finally {
    draftRestoring = false;
    panel.inert = false;
    panel.removeAttribute("aria-busy");
  }
  scheduleDraw();
}

async function restoreLocalDraft() {
  try {
    let draft = null;
    try { draft = await draftDB("get"); } catch { /* Try the compact recovery state. */ }
    let compact = null;
    try { compact = JSON.parse(localStorage.getItem(DRAFT_FAST_KEY)); } catch { /* Ignore damaged recovery data. */ }
    let missingUpload = false;
    if (compact && (!draft || compact.updatedAt > (draft.updatedAt || 0))) {
      const photoMatches = compact.state?.photoRevision && compact.state.photoRevision === draft?.state?.photoRevision;
      const logoMatches = compact.state?.logoRevision && compact.state.logoRevision === draft?.state?.logoRevision;
      missingUpload = Boolean((compact.state?.hasPhoto && !photoMatches) || (compact.state?.hasLogo && !logoMatches));
      draft = { ...compact, uploads: {
        photo: compact.state?.hasPhoto && photoMatches ? draft?.uploads?.photo || null : null,
        logo: compact.state?.hasLogo && logoMatches ? draft?.uploads?.logo || null : null
      } };
    }
    if (draft) {
      await applyDraft(draft);
      draftStatus(missingUpload ? "명함 설정은 복원했지만 저장 전에 닫힌 업로드 이미지는 다시 선택해줘." : "이 기기에 저장된 명함을 복원했어.");
    }
  } catch {
    draftStatus("저장된 명함을 복원하지 못했어. 편집파일을 열거나 새로 작성해줘.");
  }
}

async function saveDraftFile() {
  if (isCharacterLoading || isLogoLoading || isPhotoLoading || draftRestoring) return;
  try {
    const draft = await captureDraft();
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mail-card-project.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    draftStatus("편집파일을 저장했어. 입력 내용과 업로드 이미지가 포함돼.");
  } catch {
    draftStatus("편집파일을 저장하지 못했어. 다시 시도해줘.");
  }
}

async function openDraftFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const button = document.getElementById("openDraftBtn");
  button.disabled = true;
  try {
    if (file.size > 60 * 1024 * 1024) throw new Error("편집파일은 60MB 이하로 선택해줘.");
    const draft = JSON.parse(await file.text());
    await applyDraft(draft);
    draftStatus("편집파일을 열었어.");
  } catch (error) {
    draftStatus(error instanceof SyntaxError ? "올바른 JSON 편집파일을 선택해줘." : error.message);
  } finally {
    event.target.value = "";
    button.disabled = false;
  }
}

function bindDraftEvents() {
  document.getElementById("saveDraftBtn").addEventListener("click", saveDraftFile);
  document.getElementById("openDraftBtn").addEventListener("click", () => document.getElementById("draftFile").click());
  document.getElementById("draftFile").addEventListener("change", openDraftFile);
  document.querySelector(".panel").addEventListener("input", scheduleDraftSave);
  document.querySelector(".panel").addEventListener("change", scheduleDraftSave);
}
