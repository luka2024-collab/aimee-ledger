const STORAGE_KEY = "simple-ledger-records-v1";
const SUPABASE_URL = "https://adyapeupmxggzcazmhhy.supabase.co";
const SUPABASE_KEY = "sb_publishable_bzyUiwQkkBVA0o2kDYOjYg_w-7d1veq";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const MESSAGE_TRANSLATE_CACHE_KEY = "ledger-message-translate-cache-v1";
const LANGUAGE_KEY = "simple-ledger-language-v1";
const THEME_KEY = "simple-ledger-theme-v1";
const WHATSAPP_KEY = "simple-ledger-whatsapp-number-v1";
const MESSAGES_KEY = "simple-ledger-messages-v1";
const SUMMARY_VISIBLE_KEY = "simple-ledger-summary-visible-v1";
const SUMMARY_BG_KEY = "simple-ledger-summary-bg-v1";

const LOVE_MRWANG_KEY = "love-index-mrwang-10-v3";
const LOVE_MSGU_KEY = "love-index-msgu-10-v3";

function readLoveIndexes() {
  return {
    mrwang: Number(localStorage.getItem(LOVE_MRWANG_KEY) || 0),
    msgu: Number(localStorage.getItem(LOVE_MSGU_KEY) || 0)
  };
}

function applyLoveIndexes(value) {
  if (!value) return;

  if (value.mrwang !== undefined) {
    localStorage.setItem(LOVE_MRWANG_KEY, String(value.mrwang));
  }

  if (value.msgu !== undefined) {
    localStorage.setItem(LOVE_MSGU_KEY, String(value.msgu));
  }

  document.dispatchEvent(new CustomEvent("ledger-love-indexes-updated"));
}

function installLoginPanel() {
  if (document.getElementById("loginPanel")) return;

  const style = document.createElement("style");
  style.textContent = `
    .login-panel {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: grid;
      place-items: center;
      background: rgba(245, 247, 246, 0.94);
      backdrop-filter: blur(12px);
    }

    .login-card {
      width: min(340px, calc(100vw - 32px));
      padding: 24px;
      border-radius: 22px;
      background: #fff;
      box-shadow: 0 24px 80px rgba(0,0,0,.16);
      display: grid;
      gap: 12px;
    }

    .login-card h2 {
      margin: 0;
      font-size: 24px;
    }

    .login-card input {
      height: 44px;
      border: 1px solid #d4ddd8;
      border-radius: 12px;
      padding: 0 12px;
      font-size: 15px;
    }

    .login-card button {
      height: 44px;
      border: 0;
      border-radius: 12px;
      font-weight: 900;
      background: #245ec4;
      color: #fff;
    }

    .login-card .secondary-login {
      background: #eef2f7;
      color: #1f2a37;
    }

    .login-error {
      color: #c2473d;
      font-size: 13px;
      min-height: 18px;
    }

  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "loginPanel";
  panel.className = "login-panel";
  panel.innerHTML = `
    <form class="login-card" id="loginForm">
      <h2>Aimee Gu 记账</h2>
      <input id="loginEmail" type="email" placeholder="邮箱" autocomplete="email" required>
      <input id="loginPassword" type="password" placeholder="密码，至少6位" autocomplete="current-password" required>
      <button type="submit">登录</button>
      <button class="secondary-login" id="registerBtn" type="button">注册新账号</button>
      <p class="login-error" id="loginError"></p>
    </form>
  `;

  document.body.appendChild(panel);

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorBox = document.getElementById("loginError");

    errorBox.textContent = "";

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorBox.textContent = error.message;
      return;
    }

    await refreshLoginState();
  });

  document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorBox = document.getElementById("loginError");

    errorBox.textContent = "";

    const { error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      errorBox.textContent = error.message;
      return;
    }

    errorBox.textContent = "注册成功，请直接登录。";
  });
}

async function isLoggedIn() {
  const { data } = await supabaseClient.auth.getSession();
  return !!data.session;
}

async function refreshLoginState() {
  const loggedIn = await isLoggedIn();
  const panel = document.getElementById("loginPanel");

  if (panel) panel.style.display = loggedIn ? "none" : "grid";

  if (loggedIn) {
    await loadServerData();
  }
}

const translations = {
  zh: {
    htmlLang: "zh-CN",
    locale: "zh-CN",
    currency: "CNY",
    appTitle: "Aimee Gu",
    language: "语言",
    theme: "主题",
    themeSelect: "主题选择",
    languageSelect: "语言选择",
    whatsapp: "WhatsApp聊天",
    whatsappPrompt: "请输入WhatsApp手机号，包含国家区号。例如：821012345678",
    whatsappInvalid: "手机号格式不正确，请包含国家区号。",
    amountCalculator: "金额计算器",
    yearMonthSelect: "年月选择",
    loveIndex: "来自MrWang的爱情指数：",
    loveIndexMrWang: "MrWang的爱情指数",
    loveIndexMsGu: "MsGu的爱情指数",
    contactMe: "联系我",
    todaySummary: "今日收支",
    balance: "结余",
    totalIncome: "总收入",
    totalExpense: "总开支",
    changeSummaryBg: "更换背景图片",
    hideAmount: "隐藏金额",
    showAmount: "显示金额",
    messageBoard: "留言板",
    messagePlaceholder: "随时记录任何内容",
    addMessage: "添加",
    editMessage: "修改留言",
    noMessages: "还没有留言",
    weather: "实时天气",
    year: "年",
    month: "月",
    weatherLoading: "天气",
    weatherUnavailable: "暂无天气",
    feelsLike: "体感",
    humidity: "湿度",
    wind: "风",
    weatherNames: {
      clear: "晴",
      cloudy: "多云",
      fog: "雾",
      drizzle: "小雨",
      rain: "雨",
      snow: "雪",
      storm: "雷雨",
    },
    todayLabel: "回到今天",
    monthlySummary: "本月汇总",
    income: "收入",
    expense: "开支",
    total: "总计",
    newEntry: "新增记账",
    entryType: "记账类型",
    date: "日期",
    time: "时间",
    amount: "金额",
    note: "备注",
    custom: "自定义",
    customNote: "自定义备注",
    expenseBreakdown: "开支占比",
    noExpenses: "还没有开支记录",
    addRecord: "记一笔",
    calendar: "日历",
    previousMonth: "上个月",
    nextMonth: "下个月",
    dayDetails: "当日明细",
    receiveShort: "收",
    spendShort: "支",
    noRecords: "这一天还没有记录",
    dateDetails: "日期详情",
    editRecord: "编辑记录",
    deleteRecord: "删除记录",
    save: "保存",
    close: "关闭",
    edit: "编辑",
    todayButton: (date) => `${date.getMonth() + 1}月${date.getDate()}日`,
    monthTitle: (year, month) => `${year}年${month}月`,
    dateTitle: (date, isToday) => `${isToday ? "今天 · " : ""}${date.getMonth() + 1}月${date.getDate()}日`,
    weekdays: ["一", "二", "三", "四", "五", "六", "日"],
  },
  en: {
    htmlLang: "en",
    locale: "en-US",
    currency: "USD",
    appTitle: "Aimee Gu",
    language: "Language",
    theme: "Theme",
    themeSelect: "Theme selection",
    languageSelect: "Language selection",
    whatsapp: "WhatsApp chat",
    whatsappPrompt: "Enter the WhatsApp phone number with country code. Example: 821012345678",
    whatsappInvalid: "Invalid phone number. Please include the country code.",
    amountCalculator: "Amount calculator",
    yearMonthSelect: "Year and month selection",
    loveIndex: "Love index from MrWang:",
    loveIndexMrWang: "MrWang love index",
    loveIndexMsGu: "MsGu love index",
    contactMe: "Contact me",
    todaySummary: "Today",
    balance: "Balance",
    totalIncome: "Total income",
    totalExpense: "Total expense",
    changeSummaryBg: "Change background image",
    hideAmount: "Hide amount",
    showAmount: "Show amount",
    messageBoard: "Message board",
    messagePlaceholder: "Write anything anytime",
    addMessage: "Add",
    editMessage: "Edit message",
    noMessages: "No messages yet",
    weather: "Live weather",
    year: "Year",
    month: "Month",
    weatherLoading: "Weather",
    weatherUnavailable: "No weather",
    feelsLike: "Feels",
    humidity: "Humidity",
    wind: "Wind",
    weatherNames: {
      clear: "Clear",
      cloudy: "Cloudy",
      fog: "Fog",
      drizzle: "Drizzle",
      rain: "Rain",
      snow: "Snow",
      storm: "Storm",
    },
    todayLabel: "Back to today",
    monthlySummary: "Monthly summary",
    income: "Income",
    expense: "Expense",
    total: "Total",
    newEntry: "New entry",
    entryType: "Entry type",
    date: "Date",
    time: "Time",
    amount: "Amount",
    note: "Note",
    custom: "Custom",
    customNote: "Custom note",
    expenseBreakdown: "Expense share",
    noExpenses: "No expenses yet",
    addRecord: "Add record",
    calendar: "Calendar",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    dayDetails: "Daily details",
    receiveShort: "In",
    spendShort: "Out",
    noRecords: "No records for this day",
    dateDetails: "Date details",
    editRecord: "Edit record",
    deleteRecord: "Delete",
    save: "Save",
    close: "Close",
    edit: "Edit",
    todayButton: (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    monthTitle: (year, month) => `${month}/${year}`,
    dateTitle: (date, isToday) => `${isToday ? "Today · " : ""}${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  ko: {
    htmlLang: "ko",
    locale: "ko-KR",
    currency: "KRW",
    appTitle: "Aimee Gu",
    language: "언어",
    theme: "테마",
    themeSelect: "테마 선택",
    languageSelect: "언어 선택",
    whatsapp: "WhatsApp 채팅",
    whatsappPrompt: "국가번호를 포함한 WhatsApp 전화번호를 입력하세요. 예: 821012345678",
    whatsappInvalid: "전화번호 형식이 올바르지 않습니다. 국가번호를 포함하세요.",
    amountCalculator: "금액 계산기",
    yearMonthSelect: "연월 선택",
    loveIndex: "MrWang의 사랑 지수:",
    loveIndexMrWang: "MrWang 사랑 지수",
    loveIndexMsGu: "MsGu 사랑 지수",
    contactMe: "연락하기",
    todaySummary: "오늘 수지",
    balance: "잔액",
    totalIncome: "총수입",
    totalExpense: "총지출",
    changeSummaryBg: "배경 이미지 변경",
    hideAmount: "금액 숨기기",
    showAmount: "금액 보기",
    messageBoard: "메시지 보드",
    messagePlaceholder: "언제든 무엇이든 기록",
    addMessage: "추가",
    editMessage: "메시지 수정",
    noMessages: "아직 메시지가 없습니다",
    weather: "실시간 날씨",
    year: "년",
    month: "월",
    weatherLoading: "날씨",
    weatherUnavailable: "날씨 없음",
    feelsLike: "체감",
    humidity: "습도",
    wind: "바람",
    weatherNames: {
      clear: "맑음",
      cloudy: "흐림",
      fog: "안개",
      drizzle: "이슬비",
      rain: "비",
      snow: "눈",
      storm: "천둥비",
    },
    todayLabel: "오늘로 이동",
    monthlySummary: "이번 달 요약",
    income: "수입",
    expense: "지출",
    total: "합계",
    newEntry: "새 기록",
    entryType: "기록 유형",
    date: "날짜",
    time: "시간",
    amount: "금액",
    note: "메모",
    custom: "직접 입력",
    customNote: "직접 입력 메모",
    expenseBreakdown: "지출 비율",
    noExpenses: "아직 지출 기록이 없습니다",
    addRecord: "기록하기",
    calendar: "캘린더",
    previousMonth: "이전 달",
    nextMonth: "다음 달",
    dayDetails: "하루 내역",
    receiveShort: "수입",
    spendShort: "지출",
    noRecords: "이 날의 기록이 없습니다",
    dateDetails: "날짜 상세",
    editRecord: "기록 수정",
    deleteRecord: "삭제",
    save: "저장",
    close: "닫기",
    edit: "수정",
    todayButton: (date) => `${date.getMonth() + 1}월 ${date.getDate()}일`,
    monthTitle: (year, month) => `${year}년 ${month}월`,
    dateTitle: (date, isToday) => `${isToday ? "오늘 · " : ""}${date.getMonth() + 1}월 ${date.getDate()}일`,
    weekdays: ["월", "화", "수", "목", "금", "토", "일"],
  },
};

const categorySets = {
  income: [
    { key: "custom", zh: "自定义", en: "Custom", ko: "직접 입력" },
    { key: "salary", zh: "工资", en: "Salary", ko: "월급" },
    { key: "bonus", zh: "奖金", en: "Bonus", ko: "보너스" },
    { key: "partTime", zh: "兼职", en: "Part-time", ko: "부업" },
    { key: "investment", zh: "投资", en: "Investment", ko: "투자" },
    { key: "gift", zh: "红包", en: "Gift", ko: "용돈" },
    { key: "otherIncome", zh: "其他收入", en: "Other income", ko: "기타 수입" },
  ],
  expense: [
    { key: "custom", zh: "自定义", en: "Custom", ko: "직접 입력" },
    { key: "food", zh: "餐饮", en: "Food", ko: "식비" },
    { key: "transport", zh: "交通", en: "Transport", ko: "교통" },
    { key: "shopping", zh: "购物", en: "Shopping", ko: "쇼핑" },
    { key: "housing", zh: "住房", en: "Housing", ko: "주거" },
    { key: "entertainment", zh: "娱乐", en: "Entertainment", ko: "여가" },
    { key: "health", zh: "医疗", en: "Health", ko: "의료" },
    { key: "study", zh: "学习", en: "Study", ko: "학습" },
    { key: "otherExpense", zh: "其他开支", en: "Other expense", ko: "기타 지출" },
  ],
};

const themes = [
  { key: "mist", label: "Soft Mist", icon: "✦", colors: ["#edf1ee", "#6aa8ff", "#7bdcb5"] },
  { key: "candy", label: "Candy Pop", icon: "♡", colors: ["#fff1f7", "#ff7ab6", "#ffd166"] },
  { key: "peach", label: "Peach Soda", icon: "☼", colors: ["#fff2e6", "#ff9f6e", "#8ed7c6"] },
  { key: "mint", label: "Mint Bear", icon: "◌", colors: ["#ecfff5", "#52c99b", "#7fd7ff"] },
  { key: "sky", label: "Sky Bunny", icon: "☆", colors: ["#eef7ff", "#69a7ff", "#b8a4ff"] },
  { key: "lavender", label: "Lavender", icon: "✿", colors: ["#f5efff", "#a98cff", "#ff9dd8"] },
  { key: "lemon", label: "Lemon Cat", icon: "●", colors: ["#fffbe8", "#ffd84d", "#76c893"] },
  { key: "coral", label: "Coral Fun", icon: "◆", colors: ["#fff0ed", "#ff7f6e", "#5cc8c8"] },
  { key: "mono", label: "Milk Tea", icon: "○", colors: ["#f7f0e8", "#b98b68", "#7f8f7a"] },
];

const chartColors = ["#245ec4", "#0f7a55", "#c2473d", "#b56b12", "#7a57c8", "#188a99", "#d14f85", "#5f6b75"];

const state = {
  records: loadRecords(),
  messages: loadMessages(),
  selectedType: "expense",
  selectedDate: toDateKey(new Date()),
  visibleMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  chartYear: new Date().getFullYear(),
  chartMonth: new Date().getMonth() + 1,
  language: loadLanguage(),
  theme: loadTheme(),
  weather: null,
  editId: null,
  editMessageId: null,
  summaryVisible: localStorage.getItem(SUMMARY_VISIBLE_KEY) !== "hidden",
  summaryBg: localStorage.getItem(SUMMARY_BG_KEY) || "",
  editType: "expense",
  customNoteTarget: "main",
  mainCustomNote: "",
  mainCalculatorValue: "0",
  calculatorValue: "0",
};

const els = {
  weatherWidget: document.getElementById("weatherWidget"),
  weatherIcon: document.getElementById("weatherIcon"),
  weatherTemp: document.getElementById("weatherTemp"),
  weatherText: document.getElementById("weatherText"),
  weatherLocation: document.getElementById("weatherLocation"),
  weatherDetail: document.getElementById("weatherDetail"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  messageTrack: document.getElementById("messageTrack"),
  messageBoardModal: document.getElementById("messageBoardModal"),
  messageBoardTitle: document.getElementById("messageBoardTitle"),
  messageFullList: document.getElementById("messageFullList"),
  messageEditorModal: document.getElementById("messageEditorModal"),
  messageEditorTitle: document.getElementById("messageEditorTitle"),
  messageSubmitBtn: document.getElementById("messageSubmitBtn"),
  openMessageEditor: document.getElementById("openMessageEditor"),
  closeMessageEditor: document.getElementById("closeMessageEditor"),
  closeMessageBoard: document.getElementById("closeMessageBoard"),
  themeBtn: document.getElementById("themeBtn"),
  themeMenu: document.getElementById("themeMenu"),
  whatsappBtn: document.getElementById("whatsappBtn"),
  languageBtn: document.getElementById("languageBtn"),
  languageMenu: document.getElementById("languageMenu"),
  todayBtn: document.getElementById("todayBtn"),
  summaryCard: document.querySelector(".summary-card"),
  summaryVisibilityBtn: document.getElementById("summaryVisibilityBtn"),
  summaryBgBtn: document.getElementById("summaryBgBtn"),
  summaryBgInput: document.getElementById("summaryBgInput"),
  mrwangLoveLabel: document.getElementById("mrwangLoveLabel"),
  msguLoveLabel: document.getElementById("msguLoveLabel"),
  monthIncome: document.getElementById("monthIncome"),
  monthExpense: document.getElementById("monthExpense"),
  monthTotal: document.getElementById("monthTotal"),
  incomeType: document.getElementById("incomeType"),
  expenseType: document.getElementById("expenseType"),
  entryForm: document.getElementById("entryForm"),
  dateInput: document.getElementById("dateInput"),
  amountInput: document.getElementById("amountInput"),
  amountDisplay: document.getElementById("amountDisplay"),
  inlineCalculator: document.getElementById("inlineCalculator"),
  categorySelect: document.getElementById("categorySelect"),
  prevMonth: document.getElementById("prevMonth"),
  nextMonth: document.getElementById("nextMonth"),
  monthTitle: document.getElementById("monthTitle"),
  weekdayRow: document.getElementById("weekdayRow"),
  calendarGrid: document.getElementById("calendarGrid"),
  selectedDateText: document.getElementById("selectedDateText"),
  dayTotal: document.getElementById("dayTotal"),
  dayIncome: document.getElementById("dayIncome"),
  dayExpense: document.getElementById("dayExpense"),
  entryList: document.getElementById("entryList"),
  chartTotal: document.getElementById("chartTotal"),
  chartYearSelect: document.getElementById("chartYearSelect"),
  chartMonthSelect: document.getElementById("chartMonthSelect"),
  expenseDonut: document.getElementById("expenseDonut"),
  expenseLegend: document.getElementById("expenseLegend"),
  editModal: document.getElementById("editModal"),
  closeEditBtn: document.getElementById("closeEditBtn"),
  editIncomeType: document.getElementById("editIncomeType"),
  editExpenseType: document.getElementById("editExpenseType"),
  editDateInput: document.getElementById("editDateInput"),
  editCategorySelect: document.getElementById("editCategorySelect"),
  calculatorDisplay: document.getElementById("calculatorDisplay"),
  saveEditBtn: document.getElementById("saveEditBtn"),
  deleteRecordBtn: document.getElementById("deleteRecordBtn"),
  customNoteModal: document.getElementById("customNoteModal"),
  customNoteInput: document.getElementById("customNoteInput"),
  closeCustomNoteBtn: document.getElementById("closeCustomNoteBtn"),
  saveCustomNoteBtn: document.getElementById("saveCustomNoteBtn"),
  dayDetailModal: document.getElementById("dayDetailModal"),
  closeDayDetailBtn: document.getElementById("closeDayDetailBtn"),
  modalDateText: document.getElementById("modalDateText"),
  modalDayTotal: document.getElementById("modalDayTotal"),
  modalDayIncome: document.getElementById("modalDayIncome"),
  modalDayExpense: document.getElementById("modalDayExpense"),
  modalEntryList: document.getElementById("modalEntryList"),
};

function t(key) {
  return translations[state.language][key];
}

function loadLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  return translations[saved] ? saved : "zh";
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return themes.some((theme) => theme.key === saved) ? saved : "mist";
}

function saveLanguage() {
  localStorage.setItem(LANGUAGE_KEY, state.language);
}

function saveTheme() {
  localStorage.setItem(THEME_KEY, state.theme);
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
  saveServerData();
}

function loadMessages() {
  try {
    return normalizeMessages(JSON.parse(localStorage.getItem(MESSAGES_KEY)) || []);
  } catch {
    return [];
  }
}

function saveMessages() {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(state.messages));
  saveServerData();
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function currentUserEmail() {
  return supabaseClient.auth.getUser().then(({ data }) => {
    return data.user?.email || "guest";
  });
}

function colorFromEmail(email) {
  return String(email).toLowerCase() === "mleluka2024@gmail.com"
    ? "#38bdf8"
    : "#f472b6";
}

function detectLangByText(text) {
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[a-zA-Z]/.test(text)) return "en";
  return "zh";
}

async function translateText(text, fromLang, toLang) {
  if (!text || fromLang === toLang) return text;

  const cacheKey = `${fromLang}|${toLang}|${text}`;
  const cache = JSON.parse(localStorage.getItem(MESSAGE_TRANSLATE_CACHE_KEY) || "{}");

  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const url =
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;

    const response = await fetch(url);
    const data = await response.json();

    const translated =
      data?.responseData?.translatedText || text;

    cache[cacheKey] = translated;
    localStorage.setItem(
      MESSAGE_TRANSLATE_CACHE_KEY,
      JSON.stringify(cache)
    );

    return translated;
  } catch {
    return text;
  }
}

async function buildTranslatedMessage(text) {
  const email = await currentUserEmail();
  const originalLang = detectLangByText(text);

  const message = {
    id: createRecordId(),
    text,
    authorEmail: email,
    authorColor: colorFromEmail(email),
    originalLang,
    translations: {
      zh: text,
      en: text,
      ko: text
    },
    createdAt: Date.now()
  };

  message.translations.zh = await translateText(text, originalLang, "zh");
  message.translations.en = await translateText(text, originalLang, "en");
  message.translations.ko = await translateText(text, originalLang, "ko");

  return message;
}

function displayMessageText(message) {
  return message?.translations?.[state.language] || message.text || "";
}

function normalizeMessage(message) {
  const text = String(message?.text || "");
  const originalLang = message?.originalLang || detectLangByText(text);
  const translations = {
    zh: text,
    en: text,
    ko: text,
    ...(message?.translations || {})
  };
  const authorEmail = message?.authorEmail || "";

  return {
    ...message,
    id: message?.id || createRecordId(),
    text,
    authorEmail,
    authorColor: colorFromEmail(authorEmail || "guest"),
    originalLang,
    translations,
    createdAt: message?.createdAt || Date.now()
  };
}

function normalizeMessages(messages) {
  return Array.isArray(messages) ? messages.map(normalizeMessage) : [];
}

function formatMoney(value) {
  const strings = translations[state.language];
  const hasDecimals = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat(strings.locale, {
    style: "currency",
    currency: strings.currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
}

function formatKAmount(value) {
  const absolute = Math.abs(value);
  const scaled = absolute / 1000;
  if (scaled === 0) return "0K";
  return `${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1).replace(/\.0$/, "")}K`;
}

function weatherInfo(code, isDay) {
  if (code === 0) return { key: "clear", icon: isDay ? "☀" : "☾" };
  if ([1, 2, 3].includes(code)) return { key: "cloudy", icon: isDay ? "⛅" : "☁" };
  if ([45, 48].includes(code)) return { key: "fog", icon: "≋" };
  if ([51, 53, 55, 56, 57].includes(code)) return { key: "drizzle", icon: "☂" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { key: "rain", icon: "☔" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { key: "snow", icon: "❄" };
  if ([95, 96, 99].includes(code)) return { key: "storm", icon: "⚡" };
  return { key: "cloudy", icon: "☁" };
}

function renderWeather() {
  els.weatherWidget.setAttribute("aria-label", t("weather"));
  els.weatherWidget.title = t("weather");

  if (!state.weather) {
    els.weatherIcon.textContent = "--";
    els.weatherTemp.textContent = "--°";
    els.weatherText.textContent = t("weatherLoading");
    els.weatherLocation.textContent = "--";
    els.weatherDetail.textContent = "";
    return;
  }

  if (state.weather.error) {
    els.weatherIcon.textContent = "!";
    els.weatherTemp.textContent = "--°";
    els.weatherText.textContent = t("weatherUnavailable");
    els.weatherLocation.textContent = "--";
    els.weatherDetail.textContent = "";
    return;
  }

  const info = weatherInfo(state.weather.code, state.weather.isDay);
  els.weatherIcon.textContent = info.icon;
  els.weatherTemp.textContent = `${Math.round(state.weather.temperature)}°`;
  els.weatherText.textContent = t("weatherNames")[info.key];
  els.weatherLocation.textContent = state.weather.location || "--";
  els.weatherDetail.textContent = "";
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("No geolocation"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 30 * 60 * 1000,
      timeout: 5000,
    });
  });
}
function mergeById(localItems, serverItems) {
  const map = new Map();

  [...serverItems, ...localItems].forEach((item) => {
    if (!item || !item.id) return;

    const existing = map.get(item.id);

    if (!existing) {
      map.set(item.id, item);
      return;
    }

    const existingTime = existing.updatedAt || existing.createdAt || 0;
    const itemTime = item.updatedAt || item.createdAt || 0;

    if (itemTime >= existingTime) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}

async function loadServerData() {
  try {
    const { data, error } = await supabaseClient
      .from("ledger_data")
      .select("*")
      .limit(1);

    if (error) {
      console.log("Supabase load error:", error);
      return;
    }

    if (data && data.length) {
      state.records = Array.isArray(data[0].records) ? data[0].records : [];
      state.messages = normalizeMessages(data[0].messages);
      applyLoveIndexes(data[0].love_indexes);
      state.summaryBg = data[0].summary_bg || "";

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(state.messages));
      localStorage.setItem(SUMMARY_BG_KEY, state.summaryBg);

      render();
    }
  } catch (error) {
    console.log("loadServerData failed:", error);
  }
}

async function saveServerData() {
  try {
    const payload = {
      records: state.records,
      messages: state.messages,
      love_indexes: readLoveIndexes(),
      summary_bg: state.summaryBg
    };

    const { data, error } = await supabaseClient
      .from("ledger_data")
      .select("id")
      .limit(1);

    if (error) {
      console.log("Supabase select error:", error);
      return;
    }

    if (data && data.length) {
      await supabaseClient
        .from("ledger_data")
        .update(payload)
        .eq("id", data[0].id);
    } else {
      await supabaseClient
        .from("ledger_data")
        .insert(payload);
    }
  } catch (error) {
    console.log("saveServerData failed:", error);
  }
}


function clearAllText() {
  if (state.language === "ko") {
    return {
      button: "전체 삭제",
      confirm: "모든 기기의 기록과 메시지를 전부 삭제할까요?",
      done: "모든 데이터가 삭제되었습니다."
    };
  }

  if (state.language === "en") {
    return {
      button: "Clear all",
      confirm: "Clear all records and messages on every device?",
      done: "All data has been cleared."
    };
  }

  return {
    button: "清空全部",
    confirm: "确定要清空所有设备上的记账和留言吗？",
    done: "所有数据已清空。"
  };
}

async function clearAllDevicesData() {
  const text = clearAllText();

  if (!window.confirm(text.confirm)) return;

  const clearedAt = Date.now();

  state.records = [];
  state.messages = [];

  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
  localStorage.setItem(CLEAR_ALL_KEY, String(clearedAt));

  try {
    await fetch(SERVER_CLEAR_URL, { method: "POST" });
  } catch {}

  render();
  window.alert(text.done);
}

function installClearAllButton() {
  if (document.getElementById("clearAllDevicesBtn")) return;

  const style = document.createElement("style");
  style.textContent = `
    .clear-all-devices-btn {
      position: fixed;
      right: 12px;
      bottom: 14px;
      z-index: 9999;
      min-width: 78px;
      height: 34px;
      border: 0;
      border-radius: 999px;
      background: rgba(194, 71, 61, 0.94);
      color: #fff;
      font-size: 12px;
      font-weight: 900;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
    }
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.id = "clearAllDevicesBtn";
  button.className = "clear-all-devices-btn";
  button.type = "button";
  button.textContent = clearAllText().button;
  button.addEventListener("click", clearAllDevicesData);

  document.body.appendChild(button);
}

function updateClearAllButtonText() {
  const button = document.getElementById("clearAllDevicesBtn");
  if (button) button.textContent = clearAllText().button;
}
async function loadWeather() {
  try {
    let latitude = 37.5665;
    let longitude = 126.9780;
    let usedFallbackLocation = true;

    try {
      const position = await getCurrentPosition();
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      usedFallbackLocation = false;
    } catch {
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto`;

    const [response, locationResponse] = await Promise.all([
      fetch(url),
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&localityLanguage=${state.language}`),
    ]);

    if (!response.ok) throw new Error("Weather request failed");

    const data = await response.json();
    let location = usedFallbackLocation ? "Seoul" : "";

    if (locationResponse.ok) {
      const locationData = await locationResponse.json();
      const parts = [
        locationData.principalSubdivision,
        locationData.city || locationData.locality,
      ].filter(Boolean);
      location = parts.length ? [...new Set(parts)].join(" ") : location;
    }

    state.weather = {
      temperature: data.current.temperature_2m,
      apparent: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      code: data.current.weather_code,
      isDay: data.current.is_day === 1,
      wind: data.current.wind_speed_10m,
      location,
    };
  } catch {
    state.weather = { error: true };
  }

  renderWeather();
}

function normalizeAmountInput(value) {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  const [integerPart, ...decimalParts] = cleaned.split(".");
  const decimals = decimalParts.join("").slice(0, 2);
  const integer = integerPart.replace(/^0+(?=\d)/, "");
  return { integer, decimals, hasDecimal: cleaned.includes(".") };
}

function formatAmountInput(value) {
  const { integer, decimals, hasDecimal } = normalizeAmountInput(value);
  if (!integer && !hasDecimal) return "";
  const formattedInteger = (integer || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return hasDecimal ? `${formattedInteger}.${decimals}` : formattedInteger;
}

function parseAmountInput(value) {
  return Number(value.replace(/,/g, ""));
}

function formatExpression(value) {
  return value.replace(/\*/g, "×").replace(/\//g, "÷");
}

function expressionToAmount(value) {
  const expression = value.replace(/,/g, "");
  if (!/^[\d+\-*/. ]+$/.test(expression)) return NaN;

  try {
    const result = Function(`"use strict"; return (${expression})`)();
    return Number.isFinite(result) ? Math.round(result * 100) / 100 : NaN;
  } catch {
    return NaN;
  }
}

function createRecordId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function summarize(records) {
  return records.reduce((sum, record) => {
    if (record.type === "income") sum.income += record.amount;
    if (record.type === "expense") sum.expense += record.amount;
    sum.total = sum.income - sum.expense;
    return sum;
  }, { income: 0, expense: 0, total: 0 });
}

function recordsForDate(dateKey) {
  return state.records
    .filter((record) => record.date === dateKey)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function recordsForVisibleMonth() {
  const key = monthKey(state.visibleMonth);
  return state.records.filter((record) => record.date.startsWith(key));
}

function recordsForChartMonth() {
  const key = `${state.chartYear}-${String(state.chartMonth).padStart(2, "0")}`;
  return state.records.filter((record) => record.date.startsWith(key));
}

function categoryLabel(type, key) {
  const category = categorySets[type].find((item) => item.key === key);
  return category ? category[state.language] : key;
}

function recordLabel(record) {
  if (record.customNote) return record.customNote;
  if (record.category) return categoryLabel(record.type, record.category);
  return record.note || (record.type === "income" ? t("income") : t("expense"));
}

function renderSelectOptions(select, type, selected) {
  const options = categorySets[type];
  const customText = select === els.categorySelect ? state.mainCustomNote : els.customNoteInput.value.trim();

  select.innerHTML = options.map((category) => (
    `<option value="${category.key}">${escapeHtml(category[state.language])}</option>`
  )).join("");

  if (customText) {
    const customOption = select.querySelector('option[value="custom"]');
    if (customOption) customOption.textContent = customText;
  }

  if (options.some((category) => category.key === selected)) {
    select.value = selected;
  }
}

function renderCategorySelect() {
  renderSelectOptions(els.categorySelect, state.selectedType, els.categorySelect.value);
}

function setType(type) {
  state.selectedType = type;
  els.incomeType.classList.toggle("active", type === "income");
  els.expenseType.classList.toggle("active", type === "expense");
  renderCategorySelect();
}

function setEditType(type, selectedCategory = "") {
  state.editType = type;
  els.editIncomeType.classList.toggle("active", type === "income");
  els.editExpenseType.classList.toggle("active", type === "expense");
  renderSelectOptions(els.editCategorySelect, type, selectedCategory);
}

function selectDate(dateKey, showDetails = false) {
  state.selectedDate = dateKey;
  els.dateInput.value = dateKey;

  const date = parseDateKey(dateKey);
  state.visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  render();

  if (showDetails) openDayDetailModal();
}

function renderThemeMenu() {
  els.themeMenu.innerHTML = themes.map((theme) => `
    <button type="button" data-theme="${theme.key}" class="${theme.key === state.theme ? "active" : ""}">
      <span class="theme-swatch" style="background: linear-gradient(135deg, ${theme.colors[0]} 0 34%, ${theme.colors[1]} 34% 67%, ${theme.colors[2]} 67% 100%)"></span>
      <span class="theme-icon">${theme.icon}</span>
      ${theme.label}
    </button>
  `).join("");
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  renderThemeMenu();
}

function applyLanguage() {
  const strings = translations[state.language];

  document.documentElement.lang = strings.htmlLang;
  document.title = strings.appTitle;

  els.todayBtn.textContent = strings.todayButton(new Date());
  els.todayBtn.setAttribute("aria-label", strings.todayLabel);
  els.todayBtn.title = strings.todayLabel;

  renderWeather();

  els.themeBtn.setAttribute("aria-label", strings.theme);
  els.themeBtn.title = strings.theme;
  els.themeMenu.setAttribute("aria-label", strings.themeSelect);

  els.whatsappBtn.setAttribute("aria-label", strings.whatsapp);
  els.whatsappBtn.title = strings.whatsapp;

  els.languageBtn.setAttribute("aria-label", strings.language);
  els.languageBtn.title = strings.language;
  els.languageMenu.setAttribute("aria-label", strings.languageSelect);

  els.inlineCalculator.setAttribute("aria-label", strings.amountCalculator);
  document.querySelector(".chart-controls").setAttribute("aria-label", strings.yearMonthSelect);

  els.editModal.setAttribute("aria-label", strings.editRecord);
  els.customNoteModal.setAttribute("aria-label", strings.customNote);
  els.dayDetailModal.setAttribute("aria-label", strings.dateDetails);
  els.messageBoardModal.setAttribute("aria-label", strings.messageBoard);
  els.messageEditorModal.setAttribute("aria-label", strings.editMessage);

  els.messageBoardTitle.textContent = strings.messageBoard;
  els.messageInput.placeholder = strings.messagePlaceholder;
  els.messageSubmitBtn.textContent = state.editMessageId ? strings.save : strings.addMessage;

  els.summaryBgBtn.setAttribute("aria-label", strings.changeSummaryBg);
  els.summaryBgBtn.title = strings.changeSummaryBg;

  els.mrwangLoveLabel.textContent = strings.loveIndexMrWang;
  els.msguLoveLabel.textContent = strings.loveIndexMsGu;

  els.prevMonth.setAttribute("aria-label", strings.previousMonth);
  els.prevMonth.title = strings.previousMonth;
  els.nextMonth.setAttribute("aria-label", strings.nextMonth);
  els.nextMonth.title = strings.nextMonth;

  els.closeEditBtn.setAttribute("aria-label", strings.close);
  els.closeCustomNoteBtn.setAttribute("aria-label", strings.close);
  els.closeDayDetailBtn.setAttribute("aria-label", strings.close);
  els.closeMessageBoard.setAttribute("aria-label", strings.close);
  els.closeMessageEditor.setAttribute("aria-label", strings.close);

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (strings[key]) node.textContent = strings[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    if (strings[key]) node.placeholder = strings[key];
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const key = node.dataset.i18nAria;
    if (strings[key]) {
      node.setAttribute("aria-label", strings[key]);
      node.title = strings[key];
    }
  });

  document.querySelectorAll("[data-lang]").forEach((node) => {
    node.classList.toggle("active", node.dataset.lang === state.language);
  });

  const rightNoteTitle = document.querySelector(".right-note-title");
  if (rightNoteTitle) rightNoteTitle.textContent = strings.messageBoard;

  if (els.openMessageEditor) {
    els.openMessageEditor.setAttribute("aria-label", strings.addMessage);
    els.openMessageEditor.title = strings.addMessage;
  }

  if (els.messageEditorTitle) {
    els.messageEditorTitle.textContent = state.editMessageId ? strings.editMessage : strings.messageBoard;
  }

  renderCategorySelect();

  if (!els.editModal.classList.contains("hidden")) {
    setEditType(state.editType, els.editCategorySelect.value);
    renderCalculatorDisplay();
  }
}

function renderSummary() {
  const monthSummary = summarize(recordsForVisibleMonth());
  const hiddenText = "••••";

  els.monthIncome.textContent = state.summaryVisible ? formatMoney(monthSummary.income) : hiddenText;
  els.monthExpense.textContent = state.summaryVisible ? formatMoney(monthSummary.expense) : hiddenText;
  els.monthTotal.textContent = state.summaryVisible ? formatMoney(monthSummary.total) : hiddenText;

  els.monthTotal.classList.toggle("negative", monthSummary.total < 0);
  els.summaryCard.classList.toggle("summary-hidden", !state.summaryVisible);

  els.summaryVisibilityBtn.textContent = "";
  els.summaryVisibilityBtn.setAttribute("aria-label", state.summaryVisible ? t("hideAmount") : t("showAmount"));
  els.summaryVisibilityBtn.title = state.summaryVisible ? t("hideAmount") : t("showAmount");

  if (state.summaryBg) {
    els.summaryCard.style.backgroundImage = `linear-gradient(90deg, rgba(18, 28, 30, 0.48), rgba(18, 28, 30, 0.06)), url("${state.summaryBg}")`;
  } else {
    els.summaryCard.style.backgroundImage = "";
  }
}

function renderCalendar() {
  const year = state.visibleMonth.getFullYear();
  const month = state.visibleMonth.getMonth();

  els.monthTitle.textContent = t("monthTitle")(year, month + 1);
  els.weekdayRow.innerHTML = t("weekdays").map((day) => `<span>${day}</span>`).join("");
  els.calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < leadingBlanks; i += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-day blank";
    els.calendarGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = toDateKey(new Date(year, month, day));
    const daySummary = summarize(recordsForDate(dateKey));

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.classList.toggle("selected", dateKey === state.selectedDate);
    button.classList.toggle("today", dateKey === toDateKey(new Date()));

    const hasRecords = daySummary.income || daySummary.expense;
    const totalClass = daySummary.total > 0 ? "positive" : daySummary.total < 0 ? "negative" : "";

    button.title = hasRecords
      ? `${t("income")} ${formatMoney(daySummary.income)} · ${t("expense")} ${formatMoney(daySummary.expense)} · ${t("total")} ${formatMoney(daySummary.total)}`
      : "";

    button.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="day-money income">${hasRecords ? `+${formatKAmount(daySummary.income)}` : ""}</span>
      <span class="day-money expense">${hasRecords ? `-${formatKAmount(daySummary.expense)}` : ""}</span>
      <span class="day-money net ${totalClass}">${hasRecords ? `${daySummary.total >= 0 ? "+" : "-"}${formatKAmount(daySummary.total)}` : ""}</span>
    `;

    button.addEventListener("click", () => selectDate(dateKey, true));
    els.calendarGrid.appendChild(button);
  }
}

function renderExpenseChart() {
  const expenses = recordsForChartMonth().filter((record) => record.type === "expense");
  const totals = new Map();

  expenses.forEach((record) => {
    const key = record.category === "custom" ? (record.customNote || t("custom")) : (record.category || record.note || "otherExpense");
    totals.set(key, (totals.get(key) || 0) + record.amount);
  });

  const entries = Array.from(totals.entries())
    .map(([key, amount]) => ({ key, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = entries.reduce((sum, item) => sum + item.amount, 0);
  els.chartTotal.textContent = formatMoney(total);

  if (!entries.length) {
    els.expenseDonut.style.background = "conic-gradient(#e6ece8 0 100%)";
    els.expenseLegend.innerHTML = `<p class="empty-state compact">${t("noExpenses")}</p>`;
    return;
  }

  let cursor = 0;
  const colors = chartColorsForTheme();

  const segments = entries.map((entry, index) => {
    const start = cursor;
    const percent = (entry.amount / total) * 100;
    cursor += percent;
    return `${colors[index % colors.length]} ${start}% ${cursor}%`;
  });

  els.expenseDonut.style.background = `conic-gradient(${segments.join(", ")})`;

  els.expenseLegend.innerHTML = entries.map((entry, index) => {
    const percent = (entry.amount / total) * 100;
    const label = categorySets.expense.some((category) => category.key === entry.key)
      ? categoryLabel("expense", entry.key)
      : entry.key;

    return `
      <div class="legend-item">
        <span class="legend-dot" style="background:${colors[index % colors.length]}"></span>
        <span>${escapeHtml(label)}</span>
        <strong>${percent.toFixed(1)}%</strong>
      </div>
    `;
  }).join("");
}

function chartColorsForTheme() {
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--accent").trim();
  const income = styles.getPropertyValue("--income").trim();
  const expense = styles.getPropertyValue("--expense").trim();
  const muted = styles.getPropertyValue("--muted").trim();

  return [accent, income, expense, "#b56b12", "#7a57c8", "#188a99", "#d14f85", muted].filter(Boolean);
}

function renderChartControls() {
  const recordYears = state.records
    .map((record) => Number(record.date.slice(0, 4)))
    .filter(Number.isFinite);

  const currentYear = new Date().getFullYear();
  const minYear = Math.min(currentYear - 2, ...recordYears);
  const maxYear = Math.max(currentYear + 1, ...recordYears);

  const selectedYear = String(state.chartYear);
  const selectedMonth = String(state.chartMonth);

  els.chartYearSelect.innerHTML = "";

  for (let year = minYear; year <= maxYear; year += 1) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = state.language === "en" ? String(year) : `${year}${t("year")}`;
    els.chartYearSelect.appendChild(option);
  }

  els.chartYearSelect.value = selectedYear;

  els.chartMonthSelect.innerHTML = "";

  for (let month = 1; month <= 12; month += 1) {
    const option = document.createElement("option");
    option.value = String(month);
    option.textContent = state.language === "en"
      ? new Date(2026, month - 1, 1).toLocaleDateString("en-US", { month: "short" })
      : `${month}${t("month")}`;
    els.chartMonthSelect.appendChild(option);
  }

  els.chartMonthSelect.value = selectedMonth;
}

function renderMessages() {
  if (!state.messages.length) {
    els.messageTrack.innerHTML = `<span class="message-empty">${t("noMessages")}</span>`;
    renderMessageBoardModal();
    return;
  }

  const items = state.messages.map((message, index) => (
    `<span class="message-pill" style="--accent:${message.authorColor || "var(--accent)"}">
      <strong style="background:${message.authorColor || "var(--accent)"} !important">${index + 1}</strong>
      <span class="message-text-window">
        <span class="message-text-marquee">${escapeHtml(displayMessageText(message))}</span>
      </span>
    </span>`
  )).join("");

  els.messageTrack.classList.toggle("is-scrolling", state.messages.length > 4);
  els.messageTrack.innerHTML = state.messages.length > 4 ? `${items}${items}` : items;

  renderMessageBoardModal();
}

function renderMessageBoardModal() {
  if (!els.messageFullList) return;

  if (!state.messages.length) {
    els.messageFullList.innerHTML = `<p class="message-empty">${t("noMessages")}</p>`;
    return;
  }

  els.messageFullList.innerHTML = state.messages.map((message, index) => `
    <button class="message-full-item" type="button" data-message-id="${message.id}" style="--accent:${message.authorColor || "var(--accent)"}">
      <strong style="background:${message.authorColor || "var(--accent)"} !important">${index + 1}</strong>
      <span>${escapeHtml(displayMessageText(message))}</span>
    </button>
  `).join("");
}

function openMessageBoard() {
  renderMessageBoardModal();
  els.messageBoardModal.classList.remove("hidden");
}

function closeMessageBoard() {
  els.messageBoardModal.classList.add("hidden");
}

function openMessageEditor(messageId = null) {
  state.editMessageId = messageId;

  const existing = state.messages.find((message) => message.id === messageId);

  els.messageEditorTitle.textContent = messageId ? t("editMessage") : t("messageBoard");
  els.messageSubmitBtn.textContent = messageId ? t("save") : t("addMessage");
  els.messageInput.placeholder = t("messagePlaceholder");
  els.messageInput.value = existing ? existing.text : "";

  els.messageEditorModal.classList.remove("hidden");
  els.messageInput.focus();
}

function closeMessageEditor() {
  state.editMessageId = null;
  els.messageInput.value = "";
  els.messageEditorModal.classList.add("hidden");
  els.messageEditorTitle.textContent = t("editMessage");
  els.messageSubmitBtn.textContent = t("addMessage");
}

function renderDayDetail() {
  const date = parseDateKey(state.selectedDate);
  const dayRecords = recordsForDate(state.selectedDate);
  const daySummary = summarize(dayRecords);
  const isToday = state.selectedDate === toDateKey(new Date());

  els.selectedDateText.textContent = t("dateTitle")(date, isToday);
  els.dayTotal.textContent = `${t("total")} ${formatMoney(daySummary.total)}`;
  els.dayTotal.classList.toggle("negative", daySummary.total < 0);
  els.dayIncome.textContent = `${t("receiveShort")} ${formatMoney(daySummary.income)}`;
  els.dayExpense.textContent = `${t("spendShort")} ${formatMoney(daySummary.expense)}`;

  if (!dayRecords.length) {
    els.entryList.innerHTML = `<p class="empty-state">${t("noRecords")}</p>`;
    return;
  }

  els.entryList.innerHTML = "";

  dayRecords.forEach((record) => {
    const item = document.createElement("article");
    const typeText = record.type === "income" ? t("income") : t("expense");

    item.className = `entry-item ${record.type}`;

    item.innerHTML = `
      <div>
        <strong>${escapeHtml(recordLabel(record))}</strong>
        <span>${typeText}</span>
      </div>
      <div class="entry-amount">
        <strong>${record.type === "income" ? "+" : "-"}${formatMoney(record.amount)}</strong>
        <button class="edit-record-btn" type="button" aria-label="${t("edit")}" title="${t("edit")}">✎</button>
      </div>
    `;

    item.querySelector("button").addEventListener("click", () => openEditModal(record.id));
    els.entryList.appendChild(item);
  });
}

function renderRecordRows(records) {
  if (!records.length) {
    return `<p class="empty-state">${t("noRecords")}</p>`;
  }

  return records.map((record) => {
    const typeText = record.type === "income" ? t("income") : t("expense");

    return `
      <article class="entry-item ${record.type}">
        <div>
          <strong>${escapeHtml(recordLabel(record))}</strong>
          <span>${typeText}</span>
        </div>
        <div class="entry-amount">
          <strong>${record.type === "income" ? "+" : "-"}${formatMoney(record.amount)}</strong>
          <button class="edit-record-btn" type="button" data-edit-id="${record.id}" aria-label="${t("edit")}" title="${t("edit")}">✎</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderDayDetailModal() {
  const date = parseDateKey(state.selectedDate);
  const dayRecords = recordsForDate(state.selectedDate);
  const daySummary = summarize(dayRecords);
  const isToday = state.selectedDate === toDateKey(new Date());

  els.modalDateText.textContent = t("dateTitle")(date, isToday);
  els.modalDayTotal.textContent = `${t("total")} ${formatMoney(daySummary.total)}`;
  els.modalDayTotal.classList.toggle("negative", daySummary.total < 0);
  els.modalDayIncome.textContent = `${t("receiveShort")} ${formatMoney(daySummary.income)}`;
  els.modalDayExpense.textContent = `${t("spendShort")} ${formatMoney(daySummary.expense)}`;
  els.modalEntryList.innerHTML = renderRecordRows(dayRecords);
}

function openDayDetailModal() {
  renderDayDetailModal();
  els.dayDetailModal.classList.remove("hidden");
}

function closeDayDetailModal() {
  els.dayDetailModal.classList.add("hidden");
}

function renderCalculatorDisplay() {
  els.calculatorDisplay.textContent = formatExpression(state.calculatorValue) || "0";
}

function normalizeCalculatorValue(value) {
  const normalized = normalizeAmountInput(value);

  return normalized.hasDecimal
    ? `${normalized.integer || "0"}.${normalized.decimals}`
    : (normalized.integer || "0");
}

function nextCalculatorValue(current, key) {
  const operators = ["+", "-", "*", "/"];

  if (key === "clear") return "0";
  if (key === "back") return current.length > 1 ? current.slice(0, -1) : "0";

  if (key === "=") {
    const result = expressionToAmount(current);
    return Number.isFinite(result) ? String(result) : current;
  }

  if (operators.includes(key)) {
    const base = current === "0" ? "0" : current;
    return operators.includes(base.slice(-1)) ? `${base.slice(0, -1)}${key}` : `${base}${key}`;
  }

  if (key === ".") {
    const currentNumber = current.split(/[+\-*/]/).pop();
    return currentNumber.includes(".") ? current : `${current}.`;
  }

  if (/[+\-*/]/.test(current)) return `${current}${key}`;

  const next = current === "0" ? key : `${current}${key}`;
  return formatAmountInput(next).replace(/,/g, "");
}

function renderMainCalculatorDisplay() {
  const hasOperator = /[+\-*/]/.test(state.mainCalculatorValue);

  const formatted = hasOperator
    ? formatExpression(state.mainCalculatorValue)
    : (formatAmountInput(state.mainCalculatorValue) || "0");

  els.amountDisplay.textContent = formatted;

  const amount = expressionToAmount(state.mainCalculatorValue);
  els.amountInput.value = Number.isFinite(amount) && amount > 0 ? String(amount) : "";
}

function pressMainCalculator(value) {
  const next = nextCalculatorValue(state.mainCalculatorValue, value);
  state.mainCalculatorValue = /[+\-*/]/.test(next) ? next : normalizeCalculatorValue(next);
  renderMainCalculatorDisplay();
}

function openEditModal(id) {
  const record = state.records.find((item) => item.id === id);
  if (!record) return;

  state.editId = id;
  state.calculatorValue = String(record.amount.toFixed(2)).replace(/\.00$/, "");

  els.editDateInput.value = record.date;
  els.customNoteInput.value = record.customNote || "";

  setEditType(record.type, record.category);
  renderCalculatorDisplay();

  els.editModal.classList.remove("hidden");
}

function closeEditModal() {
  state.editId = null;
  els.editModal.classList.add("hidden");
}

function openCustomNoteModal(target) {
  state.customNoteTarget = target;

  els.customNoteInput.value = target === "main"
    ? state.mainCustomNote
    : (state.records.find((record) => record.id === state.editId)?.customNote || "");

  els.customNoteModal.classList.remove("hidden");

  setTimeout(() => els.customNoteInput.focus(), 0);
}

function closeCustomNoteModal() {
  els.customNoteModal.classList.add("hidden");
}

function saveCustomNote() {
  const value = els.customNoteInput.value.trim();

  if (state.customNoteTarget === "main") {
    state.mainCustomNote = value;
    renderCategorySelect();
    els.categorySelect.value = "custom";
  } else {
    renderSelectOptions(els.editCategorySelect, state.editType, "custom");
    els.editCategorySelect.value = "custom";
  }

  closeCustomNoteModal();
}

function openWhatsappChat() {
  const saved = localStorage.getItem(WHATSAPP_KEY) || "";
  const raw = saved || window.prompt(t("whatsappPrompt"), "");

  if (!raw) return;

  const number = raw.replace(/[^\d]/g, "");

  if (number.length < 8) {
    window.alert(t("whatsappInvalid"));
    localStorage.removeItem(WHATSAPP_KEY);
    return;
  }

  localStorage.setItem(WHATSAPP_KEY, number);
  window.open(`https://wa.me/${number}`, "_blank", "noopener");
}

function handleMainCategoryPick() {
  if (els.categorySelect.value === "custom") openCustomNoteModal("main");
}

function handleEditCategoryPick() {
  if (els.editCategorySelect.value === "custom") openCustomNoteModal("edit");
}

function pressCalculator(value) {
  const next = nextCalculatorValue(state.calculatorValue, value);
  state.calculatorValue = /[+\-*/]/.test(next) ? next : normalizeCalculatorValue(next);
  renderCalculatorDisplay();
}

function saveEdit() {
  const record = state.records.find((item) => item.id === state.editId);
  const amount = expressionToAmount(state.calculatorValue);

  if (!record || !Number.isFinite(amount) || amount <= 0) return;

  record.type = state.editType;
  record.date = els.editDateInput.value || state.selectedDate;
  record.category = els.editCategorySelect.value;
  record.customNote = record.category === "custom" ? els.customNoteInput.value.trim() : "";
  record.amount = Math.round(amount * 100) / 100;
  record.updatedAt = Date.now();

  saveRecords();
  selectDate(record.date);
  closeEditModal();

  if (!els.dayDetailModal.classList.contains("hidden")) renderDayDetailModal();
}

function deleteEditingRecord() {
  if (!state.editId) return;

  state.records = state.records.filter((record) => record.id !== state.editId);

  saveRecords();
  closeEditModal();
  render();

  if (!els.dayDetailModal.classList.contains("hidden")) renderDayDetailModal();
}

function render() {
  applyTheme();
  applyLanguage();
  renderSummary();
  renderCalendar();
  renderChartControls();
  renderExpenseChart();
  renderMessages();
  renderDayDetail();
}

els.entryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = parseAmountInput(els.amountInput.value);

  if (!Number.isFinite(amount) || amount <= 0) return;

  const date = els.dateInput.value || state.selectedDate;

  state.records.push({
    id: createRecordId(),
    type: state.selectedType,
    date,
    amount: Math.round(amount * 100) / 100,
    category: els.categorySelect.value,
    customNote: els.categorySelect.value === "custom" ? state.mainCustomNote : "",
    createdAt: Date.now(),
  });

  saveRecords();

  state.selectedDate = date;

  const selectedDate = parseDateKey(state.selectedDate);
  state.visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  state.chartYear = selectedDate.getFullYear();
  state.chartMonth = selectedDate.getMonth() + 1;
  state.mainCalculatorValue = "0";
  state.mainCustomNote = "";

  renderMainCalculatorDisplay();
  render();
});

document.querySelector(".inline-calculator").addEventListener("click", (event) => {
  const button = event.target.closest("[data-main-calc]");
  if (button) pressMainCalculator(button.dataset.mainCalc);
});

els.amountDisplay.addEventListener("click", () => {
  els.inlineCalculator.classList.toggle("hidden");
});

els.summaryVisibilityBtn.addEventListener("click", () => {
  state.summaryVisible = !state.summaryVisible;
  localStorage.setItem(SUMMARY_VISIBLE_KEY, state.summaryVisible ? "visible" : "hidden");
  renderSummary();
});

els.summaryBgBtn.addEventListener("click", () => {
  els.summaryBgInput.click();
});

let bgCropper = {
  img: null,
  imageData: "",
  zoom: 1,
  x: 0,
  y: 0,
  dragging: false,
  lastX: 0,
  lastY: 0
};

function ensureBgCropperModal() {
  if (document.getElementById("bgCropperModal")) return;

  const style = document.createElement("style");
  style.textContent = `
    .bg-cropper-card {
      width: min(440px, 100%);
      margin: 0 auto;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: var(--surface);
      padding: 14px;
      box-shadow: 0 22px 60px rgba(0,0,0,.22);
    }

    .bg-cropper-canvas {
      width: 100%;
      aspect-ratio: 450 / 307;
      border-radius: 12px;
      background: #111;
      touch-action: none;
      display: block;
      cursor: grab;
    }

    .bg-cropper-tools {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }

    .bg-cropper-tools input {
      width: 100%;
    }

    .bg-cropper-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .bg-cropper-actions button {
      height: 42px;
      border: 0;
      border-radius: 10px;
      font-weight: 900;
    }

    .bg-cropper-cancel {
      background: var(--surface-soft);
      color: var(--ink);
    }

    .bg-cropper-save {
      background: var(--accent);
      color: #fff;
    }
  `;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "bgCropperModal";
  modal.className = "modal-backdrop hidden";
  modal.innerHTML = `
    <section class="bg-cropper-card">
      <div class="modal-header">
        <h2>选择背景区域</h2>
        <button id="closeBgCropperBtn" class="plain-icon" type="button">×</button>
      </div>

      <canvas id="bgCropperCanvas" class="bg-cropper-canvas" width="900" height="614"></canvas>

      <div class="bg-cropper-tools">
        <label>
          缩放
          <input id="bgCropperZoom" type="range" min="1" max="3" step="0.01" value="1">
        </label>

        <div class="bg-cropper-actions">
          <button id="cancelBgCropperBtn" class="bg-cropper-cancel" type="button">返回</button>
          <button id="saveBgCropperBtn" class="bg-cropper-save" type="button">完成</button>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(modal);

  const canvas = document.getElementById("bgCropperCanvas");
  const zoom = document.getElementById("bgCropperZoom");

  function pointerPosition(event) {
    const point = event.touches ? event.touches[0] : event;
    return { x: point.clientX, y: point.clientY };
  }

  canvas.addEventListener("mousedown", startDrag);
  canvas.addEventListener("touchstart", startDrag, { passive: false });

  window.addEventListener("mousemove", dragMove);
  window.addEventListener("touchmove", dragMove, { passive: false });

  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("touchend", stopDrag);

  zoom.addEventListener("input", () => {
    bgCropper.zoom = Number(zoom.value);
    drawBgCropper();
  });

  document.getElementById("closeBgCropperBtn").addEventListener("click", closeBgCropper);
  document.getElementById("cancelBgCropperBtn").addEventListener("click", closeBgCropper);
  document.getElementById("saveBgCropperBtn").addEventListener("click", saveBgCropper);
}

function startDrag(event) {
  event.preventDefault();
  const pos = event.touches ? event.touches[0] : event;

  bgCropper.dragging = true;
  bgCropper.lastX = pos.clientX;
  bgCropper.lastY = pos.clientY;
}

function dragMove(event) {
  if (!bgCropper.dragging) return;

  event.preventDefault();

  const pos = event.touches ? event.touches[0] : event;
  bgCropper.x += pos.clientX - bgCropper.lastX;
  bgCropper.y += pos.clientY - bgCropper.lastY;
  bgCropper.lastX = pos.clientX;
  bgCropper.lastY = pos.clientY;

  drawBgCropper();
}

function stopDrag() {
  bgCropper.dragging = false;
}

function drawBgCropper() {
  const canvas = document.getElementById("bgCropperCanvas");
  if (!canvas || !bgCropper.img) return;

  const ctx = canvas.getContext("2d");
  const cw = canvas.width;
  const ch = canvas.height;
  const img = bgCropper.img;

  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, cw, ch);

  const coverScale = Math.max(cw / img.width, ch / img.height);
  const scale = coverScale * bgCropper.zoom;

  const drawW = img.width * scale;
  const drawH = img.height * scale;

  const x = (cw - drawW) / 2 + bgCropper.x;
  const y = (ch - drawH) / 2 + bgCropper.y;

  ctx.drawImage(img, x, y, drawW, drawH);
}

function openBgCropper(imageData) {
  ensureBgCropperModal();

  const img = new Image();

  img.onload = () => {
    bgCropper.img = img;
    bgCropper.imageData = imageData;
    bgCropper.zoom = 1;
    bgCropper.x = 0;
    bgCropper.y = 0;

    document.getElementById("bgCropperZoom").value = "1";
    document.getElementById("bgCropperModal").classList.remove("hidden");

    drawBgCropper();
  };

  img.src = imageData;
}

function closeBgCropper() {
  const modal = document.getElementById("bgCropperModal");
  if (modal) modal.classList.add("hidden");
}

function saveBgCropper() {
  const canvas = document.getElementById("bgCropperCanvas");
  if (!canvas) return;

  const croppedImage = canvas.toDataURL("image/jpeg", 0.86);

  state.summaryBg = croppedImage;
  localStorage.setItem(SUMMARY_BG_KEY, state.summaryBg);

  render();
  saveServerData();

  closeBgCropper();
}

els.summaryBgInput.addEventListener("change", () => {
  const file = els.summaryBgInput.files && els.summaryBgInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    openBgCropper(String(reader.result || ""));
    els.summaryBgInput.value = "";
  });

  reader.readAsDataURL(file);
});

els.messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = els.messageInput.value.trim();

  if (!text && !state.editMessageId) return;

  els.messageSubmitBtn.disabled = true;

  try {
    if (state.editMessageId) {
      const existingIndex = state.messages.findIndex((message) => message.id === state.editMessageId);

      if (existingIndex === -1) return;

      if (!text) {
        state.messages.splice(existingIndex, 1);
      } else {
        const existing = state.messages[existingIndex];
        const updated = await buildTranslatedMessage(text);

        existing.text = updated.text;
        existing.authorEmail = updated.authorEmail;
        existing.authorColor = updated.authorColor;
        existing.originalLang = updated.originalLang;
        existing.translations = updated.translations;
        existing.updatedAt = Date.now();
      }
    } else {
      state.messages.push(
        await buildTranslatedMessage(text)
      );
    }

    saveMessages();
    closeMessageEditor();
    renderMessages();
  } finally {
    els.messageSubmitBtn.disabled = false;
  }
});

els.incomeType.addEventListener("click", () => setType("income"));
els.expenseType.addEventListener("click", () => setType("expense"));

els.editIncomeType.addEventListener("click", () => setEditType("income", els.editCategorySelect.value));
els.editExpenseType.addEventListener("click", () => setEditType("expense", els.editCategorySelect.value));

els.categorySelect.addEventListener("change", handleMainCategoryPick);
els.categorySelect.addEventListener("input", handleMainCategoryPick);
els.categorySelect.addEventListener("blur", handleMainCategoryPick);
els.categorySelect.addEventListener("click", () => {
  if (els.categorySelect.value === "custom" && state.mainCustomNote) openCustomNoteModal("main");
});

els.editCategorySelect.addEventListener("change", handleEditCategoryPick);
els.editCategorySelect.addEventListener("input", handleEditCategoryPick);
els.editCategorySelect.addEventListener("blur", handleEditCategoryPick);
els.editCategorySelect.addEventListener("click", () => {
  if (els.editCategorySelect.value === "custom") openCustomNoteModal("edit");
});

els.prevMonth.addEventListener("click", () => {
  state.visibleMonth = new Date(state.visibleMonth.getFullYear(), state.visibleMonth.getMonth() - 1, 1);
  render();
});

els.nextMonth.addEventListener("click", () => {
  state.visibleMonth = new Date(state.visibleMonth.getFullYear(), state.visibleMonth.getMonth() + 1, 1);
  render();
});

els.todayBtn.addEventListener("click", () => selectDate(toDateKey(new Date())));

els.chartYearSelect.addEventListener("change", () => {
  state.chartYear = Number(els.chartYearSelect.value);
  render();
});

els.chartMonthSelect.addEventListener("change", () => {
  state.chartMonth = Number(els.chartMonthSelect.value);
  render();
});

els.themeBtn.addEventListener("click", () => {
  els.themeMenu.classList.toggle("hidden");
  els.languageMenu.classList.add("hidden");
});

els.themeMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme]");

  if (!button) return;

  state.theme = button.dataset.theme;
  saveTheme();
  els.themeMenu.classList.add("hidden");
  render();
});

els.whatsappBtn.addEventListener("click", openWhatsappChat);

els.languageBtn.addEventListener("click", () => {
  els.languageMenu.classList.toggle("hidden");
  els.themeMenu.classList.add("hidden");
});

els.languageMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lang]");

  if (!button) return;

  state.language = button.dataset.lang;
  saveLanguage();
  els.languageMenu.classList.add("hidden");
  render();
});

document.querySelector(".calculator-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-calc]");
  if (button) pressCalculator(button.dataset.calc);
});

els.saveEditBtn.addEventListener("click", saveEdit);
els.deleteRecordBtn.addEventListener("click", deleteEditingRecord);
els.closeEditBtn.addEventListener("click", closeEditModal);
els.closeCustomNoteBtn.addEventListener("click", closeCustomNoteModal);
els.saveCustomNoteBtn.addEventListener("click", saveCustomNote);
els.closeDayDetailBtn.addEventListener("click", closeDayDetailModal);

els.openMessageEditor.addEventListener("click", (event) => {
  event.stopPropagation();
  openMessageEditor();
});

els.closeMessageEditor.addEventListener("click", closeMessageEditor);
els.closeMessageBoard.addEventListener("click", closeMessageBoard);

document.querySelector(".right-note-list").addEventListener("click", openMessageBoard);

els.messageFullList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-message-id]");

  if (!button) return;

  closeMessageBoard();
  openMessageEditor(button.dataset.messageId);
});

els.modalEntryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-id]");

  if (!button) return;

  closeDayDetailModal();
  openEditModal(button.dataset.editId);
});

els.editModal.addEventListener("click", (event) => {
  if (event.target === els.editModal) closeEditModal();
});

els.customNoteModal.addEventListener("click", (event) => {
  if (event.target === els.customNoteModal) closeCustomNoteModal();
});

els.dayDetailModal.addEventListener("click", (event) => {
  if (event.target === els.dayDetailModal) closeDayDetailModal();
});

els.messageBoardModal.addEventListener("click", (event) => {
  if (event.target === els.messageBoardModal) closeMessageBoard();
});

els.messageEditorModal.addEventListener("click", (event) => {
  if (event.target === els.messageEditorModal) closeMessageEditor();
});

document.addEventListener("click", (event) => {
  if (
    !event.target.closest("#themeBtn") &&
    !event.target.closest("#languageBtn") &&
    !event.target.closest("#whatsappBtn") &&
    !event.target.closest(".floating-menu")
  ) {
    els.themeMenu.classList.add("hidden");
    els.languageMenu.classList.add("hidden");
  }
});

els.dateInput.value = state.selectedDate;

renderMainCalculatorDisplay();
setType("expense");
installLoginPanel();
render();
refreshLoginState();
loadWeather();

window.addEventListener("focus", loadServerData);

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    loadServerData();
  }
});
/* ===== 今日收支 + 爱情指数单页样式增强版 ===== */

const LOVE_PERSONS = [
  {
    key: "mrwang",
    name: "Mr.Wang",
    storageKey: "love-index-mrwang-10-v3",
    avatar: "wang.jpeg.jpeg"
  },
  {
    key: "mrgu",
    name: "Mr.Gu",
    storageKey: "love-index-msgu-10-v3",
    avatar: "aimee-gu.jpg"
  }
];

function getLoveValue(person) {
  return Math.max(
    0,
    Math.min(10, Number(localStorage.getItem(person.storageKey) || 0))
  );
}

function setLoveValue(person, value) {
  localStorage.setItem(person.storageKey, String(value));
  if (typeof saveServerData === "function") {
    saveServerData();
  }
}

function loveMoodEmoji(value) {
  if (value <= 3) return "😌";
  if (value <= 6) return "☺️";
  if (value <= 8) return "😊";
  return "🥰";
}

function renderFloatingLovePanel() {
  const summaryCard =
    document.querySelector(".summary-card") ||
    document.querySelector(".summary-panel") ||
    document.querySelector(".summary-total") ||
    document.querySelector("[data-summary-card]");

  if (!summaryCard) return;

  let panel = document.getElementById("homeLoveGlassPanel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "homeLoveGlassPanel";
    panel.className = "home-love-glass-panel";
    summaryCard.appendChild(panel);
  }

  panel.innerHTML = LOVE_PERSONS.map((person)=>{

const value=getLoveValue(person);

const hearts=Array.from({length:10})
.map((_,i)=>{

const active=i<value;

return `
<button
class="home-love-heart ${active?"active":""}"
data-love-person="${person.key}"
data-love-value="${i+1}">
${active?"♥":"♡"}
</button>
`;

}).join("");

return `

<div class="home-love-row">

<div class="home-love-avatar-wrap">
<img
class="home-love-avatar"
src="${person.avatar}">
</div>

<div class="home-love-name">

<strong>${person.name}</strong>

<span>爱情指数</span>

</div>

<div class="home-love-hearts">

${hearts}

</div>

<div class="home-love-mood">

😌

</div>

</div>

`;

}).join("");

  panel.querySelectorAll(".home-love-heart").forEach((button) => {
    button.addEventListener("click", (event) => {
      const key = button.dataset.lovePerson;
      const value = Number(button.dataset.loveValue);
      const person = LOVE_PERSONS.find((item) => item.key === key);

      if (!person) return;

      setLoveValue(person, value);
      renderFloatingLovePanel();
      createHeartBurst(event.clientX, event.clientY);
    });
  });
}

function createHeartBurst(x, y) {
  const count = 26;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "floating-click-heart";
    heart.textContent = Math.random() > 0.25 ? "♥" : "✦";

    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 80;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--tx", `${tx}px`);
    heart.style.setProperty("--ty", `${ty}px`);
    heart.style.animationDelay = `${Math.random() * 0.12}s`;

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1400);
  }
}

function installHomeLoveStyle() {
  if (document.getElementById("homeLoveStyle")) return;

  const style = document.createElement("style");
  style.id = "homeLoveStyle";
  style.textContent=`

.love-container,
.love-board,
.love-panel,
#loveSection{
display:none!important;
}

.summary-card,
.summary-panel,
.summary-total{

position:relative!important;

width:100%!important;

min-height:560px!important;

border-radius:36px!important;

overflow:hidden!important;

padding:28px!important;

padding-bottom:220px!important;

background-size:cover!important;
background-position:center!important;

filter:
brightness(1.18)!important;

}

/* 标题 */

.summary-title{

font-size:28px!important;

font-weight:900!important;

color:#fff!important;

margin-bottom:8px;

}

/* 日期 */

.summary-date{

font-size:14px!important;

color:rgba(255,255,255,.85)!important;

margin-bottom:50px;

}

/* 收入 支出 结余 */

.summary-grid{

display:grid!important;

grid-template-columns:
repeat(3,1fr)!important;

align-items:center;

text-align:center;

margin-top:20px;

}

.summary-item{

position:relative;

padding:0 12px;

}

.summary-item:not(:last-child)::after{

content:"";

position:absolute;

right:0;

top:20px;

height:90px;

width:1px;

background:
rgba(255,255,255,.35);

}

.summary-label{

font-size:18px!important;

color:white!important;

margin-bottom:14px;

}

.summary-value{

font-size:34px!important;

font-weight:900!important;

color:white!important;

}

/* 毛玻璃 */

.home-love-glass-panel{

position:absolute;

left:24px;

right:24px;

bottom:24px;

padding:16px;

display:grid;

gap:10px;

border-radius:28px;

background:
rgba(255,255,255,.08)!important;

backdrop-filter:
blur(35px);

border:
1px solid rgba(255,255,255,.15);

}

/* 两行 */

.home-love-row{

display:grid;

grid-template-columns:
60px 140px 1fr 50px;

gap:14px;

align-items:center;

}

.home-love-row+.home-love-row{

border-top:
1px solid rgba(255,255,255,.1);

padding-top:10px;

}

.home-love-avatar-wrap{

width:56px;
height:56px;

border-radius:50%;

overflow:hidden;

border:
2px solid rgba(255,255,255,.6);

}

.home-love-avatar{

width:100%;
height:100%;
object-fit:cover;

}

.home-love-name strong{

font-size:18px!important;

color:white;

display:block;

}

.home-love-name span{

font-size:12px;

color:rgba(255,255,255,.8);

}

.home-love-hearts{

display:flex;

gap:6px;

}

.home-love-heart{

font-size:28px!important;

border:0;
background:none;

color:
rgba(255,255,255,.7);

}

.home-love-heart.active{

color:#ff5e86;

filter:
drop-shadow(0 0 10px pink);

}

.home-love-mood{

font-size:26px;

}
`;
  document.head.appendChild(style);
}

installHomeLoveStyle();

const oldRenderForHomeLove = typeof render === "function" ? render : null;

if (oldRenderForHomeLove) {
  render = function () {
    oldRenderForHomeLove();
    setTimeout(renderFloatingLovePanel, 0);
  };
}

window.addEventListener("load", () => {
  installHomeLoveStyle();
  renderFloatingLovePanel();
});

document.addEventListener("click", (event) => {
  const target = event.target;

  if (
    target.closest(".home-love-heart") ||
    target.closest("button") ||
    target.closest("input") ||
    target.closest("textarea") ||
    target.closest("select")
  ) {
    return;
  }

  if (target.closest(".summary-card") || target.closest(".summary-panel") || target.closest(".summary-total")) {
    createHeartBurst(event.clientX, event.clientY);
  }
});
/* ===== 最终紧凑版：参考图比例 + 手机自适应 + 10颗心完整显示 ===== */
(function () {
  const WA_PATCH_ID = "wa-final-summary-love-style";

  const PEOPLE = [
    {
      key: "mrwang",
      name: "Mr.Wang",
      storageKey: "love-index-mrwang-10-v3",
      avatarKey: "love-avatar-mrwang-v1",
      avatar: "wang.jpeg.jpeg"
    },
    {
      key: "msgu",
      name: "Ms.Gu",
      storageKey: "love-index-msgu-10-v3",
      avatarKey: "love-avatar-msgu-v1",
      avatar: "aimee-gu.jpg"
    }
  ];

  function money(value) {
    return `¥${Number(value || 0).toLocaleString("zh-CN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }

  function getDateText() {
    const date = state.selectedDate || new Date().toISOString().slice(0, 10);
    const d = new Date(date);
    const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][d.getDay()];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${week}`;
  }

  function getTodayRecords() {
    return (state.records || []).filter((item) => item.date === state.selectedDate);
  }

  function getTotals() {
    const records = getTodayRecords();
    const income = records.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expense = records.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { income, expense, balance: income - expense };
  }

  function getLoveValue(person) {
    return Math.max(0, Math.min(10, Number(localStorage.getItem(person.storageKey) || 0)));
  }

  function currentAvatar(person) {
    return localStorage.getItem(person.avatarKey) || person.avatar;
  }

  function mood(value) {
    if (value <= 2) return "😴";
    if (value <= 4) return "😌";
    if (value <= 6) return "😊";
    if (value <= 8) return "🥰";
    return "😍";
  }

  function currentBg() {
    return state.summaryBg || localStorage.getItem(SUMMARY_BG_KEY) || "";
  }

  function installStyle() {
    const old = document.getElementById(WA_PATCH_ID);
    if (old) old.remove();

    const style = document.createElement("style");
    style.id = WA_PATCH_ID;
    style.textContent = `
      .love-container,
      .love-board,
      .love-panel,
      .love-section,
      #loveSection,
      .love-growth,
      .love-timeline,
      .love-chart,
      #loveGrowthChart,
      #loveTimeline,
      .home-love-glass-panel {
        display: none !important;
      }

      .phone-shell {
        width: min(440px, 100%) !important;
        margin: 0 auto !important;
        padding: 14px 12px 28px !important;
      }

      .summary-grid,
      .summary-hero {
        display: block !important;
        width: 100% !important;
        margin: 0 0 12px !important;
      }

      .summary-card,
      .summary-panel,
      .summary-total {
        width: 100% !important;
        max-width: 100% !important;
        height: 284px !important;
        min-height: 284px !important;
        max-height: 284px !important;
        margin: 0 auto 14px !important;
        padding: 0 !important;
        border-radius: 28px !important;
        overflow: hidden !important;
        position: relative !important;
        background: none !important;
        box-shadow: 0 16px 38px rgba(139, 54, 88, .12) !important;
        border: 1px solid rgba(255,255,255,.86) !important;
      }

      .wa-final-card {
        position: absolute !important;
        inset: 0 !important;
        border-radius: 28px !important;
        overflow: hidden !important;
        background-size: cover !important;
        background-position: center center !important;
        color: #fff !important;
      }

      .wa-final-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(rgba(0,0,0,.08), rgba(0,0,0,.16));
        z-index: 1;
      }

      .wa-bg-btn {
        position: absolute !important;
        top: 16px !important;
        right: 16px !important;
        z-index: 8 !important;
        width: 34px !important;
        height: 34px !important;
        border: 0 !important;
        border-radius: 12px !important;
        background: rgba(255,255,255,.22) !important;
        color: #fff !important;
        font-size: 18px !important;
        font-weight: 900 !important;
        backdrop-filter: blur(16px) !important;
      }

      .wa-bg-btn svg {
        width: 20px !important;
        height: 20px !important;
        display: block !important;
        margin: auto !important;
      }

      .wa-bg-btn path,
      .wa-bg-btn circle {
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      .wa-bg-file {
        display: none !important;
      }

      .wa-final-content {
        position: relative !important;
        z-index: 2 !important;
        height: 100% !important;
        padding: 18px 20px !important;
        box-sizing: border-box !important;
        text-align: left !important;
      }

      .wa-title {
        font-size: 32px !important;
        font-weight: 900 !important;
        line-height: 1 !important;
        letter-spacing: 0 !important;
        color: #fff !important;
        text-align: left !important;
        text-shadow: 0 2px 9px rgba(0,0,0,.38) !important;
      }

      .wa-date {
        margin-top: 10px !important;
        font-size: 15px !important;
        line-height: 1.15 !important;
        font-weight: 800 !important;
        color: rgba(255,255,255,.92) !important;
        text-align: left !important;
        text-shadow: 0 2px 8px rgba(0,0,0,.34) !important;
      }

      .wa-money-grid {
        position: absolute !important;
        left: 18px !important;
        right: 18px !important;
        top: 92px !important;
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        column-gap: 12px !important;
        align-items: start !important;
        text-align: left !important;
        z-index: 3 !important;
      }

      .wa-money-item {
        position: relative !important;
        min-width: 0 !important;
        padding-left: 0 !important;
      }

      .wa-money-item:not(:last-child)::after {
        content: "" !important;
        position: absolute !important;
        right: 0 !important;
        top: 6px !important;
        width: 1px !important;
        height: 54px !important;
        background: rgba(255,255,255,.42) !important;
      }

      .wa-money-label {
        font-size: 15px !important;
        font-weight: 900 !important;
        color: rgba(255,255,255,.96) !important;
        line-height: 1 !important;
        margin-bottom: 11px !important;
        text-shadow: 0 2px 8px rgba(0,0,0,.36) !important;
      }

      .wa-money-value {
        display: inline-block !important;
        max-width: none !important;
        font-size: 18px !important;
        font-weight: 900 !important;
        color: rgba(255,255,255,.98) !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        transform: none !important;
        transform-origin: left center !important;
        text-shadow: 0 3px 10px rgba(0,0,0,.36) !important;
      }

      .wa-love-glass {
        position: absolute !important;
        left: 14px !important;
        right: 14px !important;
        bottom: 12px !important;
        z-index: 5 !important;
        display: grid !important;
        gap: 4px !important;
        padding: 9px 12px !important;
        border-radius: 22px !important;
        background: transparent !important;
        border: 0 !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        box-shadow: none !important;
      }

      .wa-love-row {
        display: grid !important;
        grid-template-columns: 42px minmax(0, 1fr) !important;
        gap: 7px !important;
        align-items: center !important;
        min-height: 43px !important;
      }

      .wa-love-row + .wa-love-row {
        padding-top: 5px !important;
        border-top: 0 !important;
      }

      .wa-avatar-wrap {
        position: relative !important;
        width: 40px !important;
        height: 40px !important;
      }

      .wa-avatar {
        width: 40px !important;
        height: 40px !important;
        border-radius: 999px !important;
        overflow: hidden !important;
        border: 2px solid rgba(255,255,255,.88) !important;
        background: rgba(255,255,255,.45) !important;
      }

      .wa-avatar img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }

      .wa-avatar-edit {
        position: absolute !important;
        right: -4px !important;
        bottom: -4px !important;
        z-index: 2 !important;
        width: 18px !important;
        height: 18px !important;
        border: 1px solid rgba(255,255,255,.74) !important;
        border-radius: 50% !important;
        background: rgba(244,102,126,.88) !important;
        color: #fff !important;
        display: grid !important;
        place-items: center !important;
        padding: 0 !important;
        box-shadow: 0 2px 6px rgba(0,0,0,.20) !important;
      }

      .wa-avatar-edit svg {
        width: 10px !important;
        height: 10px !important;
        display: block !important;
      }

      .wa-avatar-edit path {
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 2.2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      .wa-avatar-input {
        display: none !important;
      }

      .wa-name {
        min-width: 0 !important;
        display: grid !important;
        justify-items: start !important;
      }

      .wa-name strong {
        display: block !important;
        font-size: 16px !important;
        line-height: 1 !important;
        font-weight: 900 !important;
        color: #fff !important;
        white-space: nowrap !important;
        text-align: left !important;
        text-shadow: 0 2px 8px rgba(0,0,0,.28) !important;
      }

      .wa-love-line {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        width: 100% !important;
        min-width: 0 !important;
        margin-top: 6px !important;
      }

      .wa-hearts {
        display: grid !important;
        grid-template-columns: repeat(10, 1fr) !important;
        gap: 1px !important;
        min-width: 0 !important;
        width: min(196px, calc(100% - 36px)) !important;
        max-width: 196px !important;
        margin-top: 0 !important;
        align-items: center !important;
        flex: 0 1 196px !important;
      }

      .wa-heart {
        width: 100% !important;
        min-width: 0 !important;
        height: 20px !important;
        border: 0 !important;
        background: transparent !important;
        padding: 0 !important;
        color: rgba(255,255,255,.72) !important;
        cursor: pointer !important;
        display: grid !important;
        place-items: center !important;
      }

      .wa-heart svg {
        width: 19px !important;
        height: 18px !important;
        display: block !important;
        overflow: visible !important;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,.16)) !important;
      }

      .wa-heart path {
        fill: transparent !important;
        stroke: rgba(255,255,255,.76) !important;
        stroke-width: 1.7 !important;
        stroke-linejoin: round !important;
      }

      .wa-heart.active {
        animation: none !important;
      }

      .wa-heart.active path {
        fill: #ff5f78 !important;
        stroke: rgba(255,255,255,.58) !important;
        filter: drop-shadow(0 0 5px rgba(255,95,120,.55)) !important;
      }

      .wa-mood {
        width: 30px !important;
        height: 30px !important;
        flex: 0 0 30px !important;
        display: grid !important;
        place-items: center !important;
        font-size: 26px !important;
        line-height: 1 !important;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,.18)) !important;
      }

      .wa-click-heart {
        position: fixed;
        z-index: 999999;
        pointer-events: none;
        left: 0;
        top: 0;
        font-size: 20px;
        color: #ff78a0;
        text-shadow: 0 0 10px rgba(255,120,160,.85);
        animation: waHeartBurst 1.25s ease-out forwards;
      }

      @keyframes waHeartBurst {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(.8); }
        100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.35) rotate(18deg); }
      }

      @media (max-width: 390px) {
        .phone-shell { padding-inline: 8px !important; }

        .summary-card,
        .summary-panel,
        .summary-total {
          height: 268px !important;
          min-height: 268px !important;
          max-height: 268px !important;
          border-radius: 24px !important;
        }

        .wa-final-card { border-radius: 24px !important; }
        .wa-final-content { padding: 18px 16px !important; }
        .wa-title { font-size: 29px !important; }
        .wa-date { font-size: 13px !important; }
        .wa-money-grid { top: 86px !important; left: 14px !important; right: 14px !important; column-gap: 14px !important; }
        .wa-money-label { font-size: 14px !important; margin-bottom: 10px !important; }
        .wa-money-value { font-size: 16px !important; transform: none !important; }
        .wa-money-item:not(:last-child)::after { height: 50px !important; }
        .wa-love-glass { left: 10px !important; right: 10px !important; bottom: 10px !important; padding: 9px 10px !important; border-radius: 20px !important; }
        .wa-love-row { grid-template-columns: 38px minmax(0, 1fr) !important; gap: 5px !important; min-height: 42px !important; }
        .wa-avatar-wrap,
        .wa-avatar { width: 36px !important; height: 36px !important; }
        .wa-avatar-edit { width: 17px !important; height: 17px !important; right: -4px !important; bottom: -4px !important; }
        .wa-name strong { font-size: 15px !important; }
        .wa-love-line { gap: 5px !important; margin-top: 5px !important; }
        .wa-hearts { width: min(176px, calc(100% - 31px)) !important; max-width: 176px !important; }
        .wa-heart { height: 18px !important; }
        .wa-heart svg { width: 17px !important; height: 16px !important; }
        .wa-mood { width: 26px !important; height: 26px !important; font-size: 23px !important; }
      }
    `;

    document.head.appendChild(style);
  }

  function createLoveBurst(x, y) {
    for (let i = 0; i < 18; i++) {
      const item = document.createElement("div");
      item.className = "wa-click-heart";
      item.textContent = Math.random() > 0.25 ? "♥" : "✦";
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 80;
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      item.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
      item.style.setProperty("--ty", `${Math.sin(angle) * distance - 65}px`);
      document.body.appendChild(item);
      setTimeout(() => item.remove(), 1250);
    }
  }

  function resizeAvatarImage(imageData, done) {
    const img = new Image();

    img.onload = () => {
      const size = 420;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      const scale = Math.max(size / img.width, size / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const x = (size - drawW) / 2;
      const y = (size - drawH) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, x, y, drawW, drawH);
      done(canvas.toDataURL("image/jpeg", 0.88));
    };

    img.src = imageData;
  }

  function updateAvatar(person, file) {
    if (!file) return;

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resizeAvatarImage(String(reader.result || ""), (avatarData) => {
        localStorage.setItem(person.avatarKey, avatarData);
        renderFinalSummaryLove();
      });
    });

    reader.readAsDataURL(file);
  }

  function renderFinalSummaryLove() {
    installStyle();

    const card = document.querySelector(".summary-card") || document.querySelector(".summary-panel") || document.querySelector(".summary-total");
    if (!card) return;

    const totals = getTotals();
    const bg = currentBg();

    const loveRows = PEOPLE.map((person) => {
      const value = getLoveValue(person);
      const hearts = Array.from({ length: 10 }).map((_, index) => {
        const active = index < value;
        return `
          <button class="wa-heart ${active ? "active" : ""}" type="button" data-person="${person.key}" data-value="${index + 1}" aria-label="${index + 1}">
            <svg viewBox="0 0 24 22" aria-hidden="true" focusable="false">
              <path d="M12 20.3C7.5 16.5 2.4 12.2 2.4 7.1C2.4 4.2 4.6 2 7.4 2C9.2 2 10.9 2.9 12 4.3C13.1 2.9 14.8 2 16.6 2C19.4 2 21.6 4.2 21.6 7.1C21.6 12.2 16.5 16.5 12 20.3Z"></path>
            </svg>
          </button>
        `;
      }).join("");

      return `
        <div class="wa-love-row">
          <div class="wa-avatar-wrap">
            <div class="wa-avatar"><img src="${currentAvatar(person)}" alt="${person.name}"></div>
            <input class="wa-avatar-input" id="waAvatarInput-${person.key}" type="file" accept="image/*">
            <button class="wa-avatar-edit" type="button" data-avatar-person="${person.key}" aria-label="编辑${person.name}头像" title="编辑头像">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 20h4.2L19 9.2 14.8 5 4 15.8V20Z"></path>
                <path d="M13.8 6 18 10.2"></path>
              </svg>
            </button>
          </div>
          <div class="wa-name">
            <strong>${person.name}</strong>
            <div class="wa-love-line">
              <div class="wa-hearts">${hearts}</div>
              <div class="wa-mood" aria-label="${mood(value)}">${mood(value)}</div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="wa-final-card" style="background-image:url('${bg}')">
        <input class="wa-bg-file" id="waBgFileInput" type="file" accept="image/*">
        <button class="wa-bg-btn" type="button" id="waBgChangeBtn" aria-label="选择背景图片" title="选择背景图片">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h3l1.5-2h7L17 7h3v12H4z"></path>
            <circle cx="12" cy="13" r="3.5"></circle>
            <path d="M18.5 10.5h.01"></path>
          </svg>
        </button>
        <div class="wa-final-content">
          <div class="wa-title">今日收支</div>
          <div class="wa-date">${getDateText()}</div>
          <div class="wa-money-grid">
            <div class="wa-money-item"><div class="wa-money-label">收入</div><div class="wa-money-value">${money(totals.income)}</div></div>
            <div class="wa-money-item"><div class="wa-money-label">支出</div><div class="wa-money-value">${money(totals.expense)}</div></div>
            <div class="wa-money-item"><div class="wa-money-label">结余</div><div class="wa-money-value">${money(totals.balance)}</div></div>
          </div>
        </div>
        <div class="wa-love-glass">${loveRows}</div>
      </div>
    `;

    card.querySelectorAll(".wa-heart").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const person = PEOPLE.find((item) => item.key === btn.dataset.person);
        if (!person) return;
        localStorage.setItem(person.storageKey, String(Number(btn.dataset.value)));
        if (typeof saveServerData === "function") saveServerData();
        createLoveBurst(event.clientX, event.clientY);
        renderFinalSummaryLove();
      });
    });

    card.querySelectorAll(".wa-avatar-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        const person = PEOPLE.find((item) => item.key === btn.dataset.avatarPerson);
        const input = person ? card.querySelector(`#waAvatarInput-${person.key}`) : null;
        if (input) input.click();
      });
    });

    card.querySelectorAll(".wa-avatar-input").forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.id.replace("waAvatarInput-", "");
        const person = PEOPLE.find((item) => item.key === key);
        const file = input.files && input.files[0];
        if (person && file) updateAvatar(person, file);
        input.value = "";
      });
    });

    const bgBtn = card.querySelector("#waBgChangeBtn");
    const bgInput = card.querySelector("#waBgFileInput");
    if (bgBtn && bgInput) bgBtn.addEventListener("click", () => bgInput.click());
    if (bgInput) {
      bgInput.addEventListener("change", () => {
        const file = bgInput.files && bgInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          if (typeof openBgCropper === "function") {
            openBgCropper(String(reader.result || ""));
          }
          bgInput.value = "";
        });
        reader.readAsDataURL(file);
      });
    }
  }

  const oldRender = typeof render === "function" ? render : null;

  if (oldRender && !window.__WA_FINAL_RENDER_PATCHED_COMPACT__) {
    window.__WA_FINAL_RENDER_PATCHED_COMPACT__ = true;
    render = function () {
      oldRender();
      setTimeout(renderFinalSummaryLove, 0);
    };
  }

  installStyle();
  setTimeout(renderFinalSummaryLove, 0);
})();
