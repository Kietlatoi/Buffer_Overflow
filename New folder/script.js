/* ============================================
   BUFFER OVERFLOW — Educational Website
   script.js  — Interactive features
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  hljs.highlightAll();
  initHeroAnim();
  initSidebar();
  initTabs();
  initPayloadSim();
  initQuiz();
  initScrollSpy();
});

/* =========================================
   HERO ANIMATION — animated memory cells
   ========================================= */
function initHeroAnim() {
  const container = document.getElementById("heroMem");
  if (!container) return;

  const rows = [
    {
      addr: "0xbffff59c",
      label: "Return Addr",
      val: "0x08048478",
      type: "ret",
    },
    { addr: "0xbffff598", label: "Saved EBP", val: "0xbffff5a8", type: "ebp" },
    { addr: "0xbffff590", label: "Padding", val: "0x00000001", type: "pad" },
    { addr: "0xbffff58c", label: "Padding", val: "0x00000000", type: "pad" },
    {
      addr: "0xbffff588",
      label: "array[28-29]",
      val: "0x00000000",
      type: "buf",
    },
    {
      addr: "0xbffff584",
      label: "array[20-23]",
      val: "0x00000000",
      type: "buf",
    },
    {
      addr: "0xbffff580",
      label: "array[16-19]",
      val: "0x00000000",
      type: "buf",
    },
    {
      addr: "0xbffff57c",
      label: "array[12-15]",
      val: "0x00000000",
      type: "buf",
    },
    {
      addr: "0xbffff578",
      label: "array[8-11]",
      val: "0x00000000",
      type: "buf",
    },
    { addr: "0xbffff574", label: "array[4-7]", val: "0x00000000", type: "buf" },
    { addr: "0xbffff572", label: "array[0-3]", val: "0x00000000", type: "buf" },
  ];

  const colorMap = {
    ret: "#f85149",
    ebp: "#e3822a",
    pad: "#d29922",
    buf: "#3fb950",
  };

  rows.forEach((r, i) => {
    const div = document.createElement("div");
    div.style.cssText = `
      display:flex; gap:12px; align-items:center;
      padding:5px 10px; border-radius:4px;
      border:1px solid rgba(255,255,255,0.06);
      background:rgba(255,255,255,0.02);
      opacity:0; transform:translateX(20px);
      transition: opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s;
    `;
    const c = colorMap[r.type] || "#8b949e";
    div.innerHTML = `
      <span style="color:#8b949e;font-size:0.68rem;min-width:90px;">${r.addr}</span>
      <span style="width:8px;height:8px;background:${c};border-radius:50%;flex-shrink:0;"></span>
      <span style="color:#8b949e;font-size:0.68rem;min-width:100px;">${r.label}</span>
      <span style="color:${c};font-size:0.68rem;">${r.val}</span>
    `;
    container.appendChild(div);
    requestAnimationFrame(() => {
      div.style.opacity = "1";
      div.style.transform = "translateX(0)";
    });
  });

  // Animate overflow effect periodically
  let overflowActive = false;
  setInterval(() => {
    if (overflowActive) return;
    overflowActive = true;
    const bufRows = container.querySelectorAll("div");
    let delay = 0;
    bufRows.forEach((row, idx) => {
      setTimeout(() => {
        const cells = row.querySelectorAll("span");
        cells.forEach((c) => {
          if (c.textContent.startsWith("0x0000")) c.textContent = "0x41414141";
        });
        row.style.borderColor = "rgba(88,166,255,0.4)";
      }, delay);
      delay += 80;
    });
    setTimeout(() => {
      bufRows.forEach((row) => {
        const cells = row.querySelectorAll("span");
        cells.forEach((c) => {
          if (c.textContent === "0x41414141") c.textContent = "0x00000000";
        });
        row.style.borderColor = "rgba(255,255,255,0.06)";
      });
      overflowActive = false;
    }, delay + 1200);
  }, 5000);
}

/* =========================================
   SIDEBAR — mobile toggle + scroll spy
   ========================================= */
function initSidebar() {
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
  // Close sidebar when clicking main on mobile
  document.getElementById("main-content")?.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll(".section[id], #hero");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`,
            );
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  sections.forEach((s) => observer.observe(s));
}

/* =========================================
   TABS (GDB section)
   ========================================= */
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      const container = btn.closest(".tab-container");
      container
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      container
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      container.querySelector(`#${tabId}`)?.classList.add("active");
    });
  });
}

/* =========================================
   PAYLOAD SIMULATOR
   ========================================= */

/* Stack layout for simulation (from low to high address) */
const STACK_LAYOUT = [
  { addr: "0xbffff572", label: "array[0–3]", size: 4, zone: "buf" },
  { addr: "0xbffff576", label: "array[4–7]", size: 4, zone: "buf" },
  { addr: "0xbffff57a", label: "array[8–11]", size: 4, zone: "buf" },
  { addr: "0xbffff57e", label: "array[12–15]", size: 4, zone: "buf" },
  { addr: "0xbffff582", label: "array[16–19]", size: 4, zone: "buf" },
  { addr: "0xbffff586", label: "array[20–23]", size: 4, zone: "buf" },
  { addr: "0xbffff58a", label: "array[24–27]", size: 4, zone: "buf" },
  { addr: "0xbffff58e", label: "array[28–29]", size: 2, zone: "buf" },
  { addr: "0xbffff590", label: "Padding (4B)", size: 4, zone: "pad" },
  { addr: "0xbffff594", label: "Padding (4B)", size: 4, zone: "pad" },
  { addr: "0xbffff598", label: "Saved EBP", size: 4, zone: "ebp" },
  { addr: "0xbffff59c", label: "Return Address", size: 4, zone: "ret" },
];

const ZONE_COLORS = {
  buf: { safe: "byte-A", over: "byte-B", class: "sv-row-buf" },
  pad: { safe: "byte-null", over: "byte-B", class: "sv-row-pad" },
  ebp: { safe: "byte-null", over: "byte-C", class: "sv-row-ebp" },
  ret: { safe: "byte-null", over: "byte-C", class: "sv-row-ret" },
};

const ZONE_LABELS = {
  buf: "Buffer (array[30])",
  pad: "Padding (compiler)",
  ebp: "Saved EBP",
  ret: "Return Address",
};

const ORIGINAL_VALS = {
  ret: "08 04 84 78",
  ebp: "bf ff f5 a8",
  pad: "00 00 00 00",
  buf: "00 00 00 00",
};

function initPayloadSim() {
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById("payloadInput");
      if (input) input.value = btn.dataset.payload;
    });
  });

  document
    .getElementById("simulateBtn")
    ?.addEventListener("click", runSimulation);
  document
    .getElementById("resetBtn")
    ?.addEventListener("click", resetSimulation);

  // Draw empty stack on load
  drawStack("");
}

function runSimulation() {
  const input = document.getElementById("payloadInput");
  const payload = input?.value || "";
  drawStack(payload);
}

function resetSimulation() {
  const input = document.getElementById("payloadInput");
  if (input) input.value = "";
  drawStack("");
  const result = document.getElementById("attackResult");
  if (result) {
    result.className = "attack-result hidden";
    result.textContent = "";
  }
}

function getByteClass(char) {
  if (!char) return "byte-null";
  const c = char.charCodeAt(0);
  if (c === 0x41) return "byte-A";
  if (c === 0x42) return "byte-B";
  if (c === 0x43) return "byte-C";
  return "byte-other";
}

function hexByte(char) {
  if (!char) return "??";
  return char.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase();
}

function drawStack(payload) {
  const container = document.getElementById("stackVisual");
  if (!container) return;
  container.innerHTML = "";

  // Add header
  const hdr = document.createElement("div");
  hdr.style.cssText =
    "padding:8px 12px;font-size:0.75rem;color:var(--text-dim);display:flex;gap:8px;align-items:center;font-family:var(--font-mono);border-bottom:1px solid var(--border);margin-bottom:4px;";
  hdr.innerHTML =
    '<span style="min-width:110px">Địa chỉ</span><span style="min-width:150px">Vùng nhớ</span><span>Nội dung (hex)</span>';
  container.appendChild(hdr);

  let payloadOffset = 0;
  let retOverwritten = false;
  let ebpOverwritten = false;

  // Display from highest address to lowest (visual stack = ret on top, buf on bottom)
  const reversed = [...STACK_LAYOUT].reverse();

  reversed.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = `sv-row ${ZONE_COLORS[row.zone]?.class || ""}`;

    // addr
    const addrEl = document.createElement("span");
    addrEl.className = "sv-addr";
    addrEl.textContent = row.addr;
    rowEl.appendChild(addrEl);

    // label
    const labelEl = document.createElement("span");
    labelEl.className = "sv-label";
    labelEl.textContent = ZONE_LABELS[row.zone];
    rowEl.appendChild(labelEl);

    // bytes
    const bytesEl = document.createElement("span");
    bytesEl.className = "sv-bytes";

    // Calculate where in payload this row starts
    const rowStart = STACK_LAYOUT.findIndex((r) => r.addr === row.addr);
    let byteOffset = STACK_LAYOUT.slice(0, rowStart).reduce(
      (s, r) => s + r.size,
      0,
    );

    let rowOverflowed = false;
    for (let i = 0; i < row.size; i++) {
      const byteEl = document.createElement("span");
      byteEl.className = "sv-byte";

      if (byteOffset + i < payload.length) {
        const ch = payload[byteOffset + i];
        byteEl.className = `sv-byte ${getByteClass(ch)}`;
        byteEl.textContent = hexByte(ch);
        rowOverflowed = true;
        if (row.zone === "ret") retOverwritten = true;
        if (row.zone === "ebp") ebpOverwritten = true;
      } else {
        byteEl.className = "sv-byte byte-null";
        byteEl.textContent =
          row.zone === "ret"
            ? ["08", "04", "84", "78"][i] || "00"
            : row.zone === "ebp"
              ? ["bf", "ff", "f5", "a8"][i] || "00"
              : "00";
      }
      bytesEl.appendChild(byteEl);
    }

    if (rowOverflowed && row.zone !== "buf") {
      rowEl.classList.add("overflowed");
    }
    rowEl.appendChild(bytesEl);
    container.appendChild(rowEl);
  });

  // Show result
  showAttackResult(payload.length, retOverwritten, ebpOverwritten);
}

function showAttackResult(len, retOver, ebpOver) {
  const result = document.getElementById("attackResult");
  if (!result) return;
  result.classList.remove("hidden", "safe", "warning", "danger");

  if (len === 0) {
    result.classList.add("hidden");
    return;
  }

  if (retOver) {
    result.className = "attack-result danger";
    result.innerHTML = `💀 <strong>TẤN CÔNG THÀNH CÔNG!</strong> Return Address đã bị ghi đè bởi payload (${len} bytes). Chương trình sẽ bị crash (Segfault) hoặc thực thi mã tùy ý!`;
  } else if (ebpOver) {
    result.className = "attack-result warning";
    result.innerHTML = `🚨 <strong>Saved EBP bị hỏng!</strong> Payload ${len} bytes đã tràn vào Saved EBP. Return Address chưa bị ghi đè — cần thêm ${38 + 8 + 4 - len} bytes nữa.`;
  } else if (len > 30) {
    result.className = "attack-result warning";
    result.innerHTML = `⚠️ <strong>Tràn vào vùng padding!</strong> Payload ${len} bytes vượt quá buffer (30 bytes). Cần ${38 + 8 + 4 - len} bytes thêm để ghi đè Return Address.`;
  } else {
    result.className = "attack-result safe";
    result.innerHTML = `✅ <strong>An toàn.</strong> Payload ${len} bytes nằm trong giới hạn buffer cho phép (≤ 30 bytes). Stack không bị ảnh hưởng.`;
  }
}

/* =========================================
   QUIZ
   ========================================= */
const QUESTIONS = [
  {
    q: "Hàm nào trong C được coi là CỰC KỲ NGUY HIỂM vì không kiểm soát độ dài đầu vào?",
    opts: ["printf()", "gets()", "fgets()", "malloc()"],
    answer: 1,
    explain:
      "gets() đọc dữ liệu từ stdin mà không giới hạn độ dài, dẫn đến nguy cơ Buffer Overflow. Nó đã bị loại khỏi chuẩn C11.",
  },
  {
    q: "Khi Buffer Overflow xảy ra, vùng nào bị ghi đè NGUY HIỂM NHẤT?",
    opts: [
      "Các biến cục bộ",
      "Vùng padding của compiler",
      "Return Address",
      "Stack Pointer (ESP)",
    ],
    answer: 2,
    explain:
      "Return Address là địa chỉ CPU sẽ nhảy đến sau khi hàm kết thúc. Ghi đè Return Address cho phép kẻ tấn công điều hướng chương trình đến vị trí bất kỳ.",
  },
  {
    q: 'Lệnh assembly "lea -0x26(%ebp), %eax" có ý nghĩa gì?',
    opts: [
      "Cộng 0x26 vào EBP",
      "Load địa chỉ của biến array = EBP - 38 vào EAX",
      "So sánh EBP với 0x26",
      "Nhảy đến địa chỉ 0x26",
    ],
    answer: 1,
    explain:
      "Lệnh LEA (Load Effective Address) tính địa chỉ EBP - 0x26 (tức là EBP - 38) và lưu vào EAX. Đây là địa chỉ bắt đầu của biến mảng array trên stack.",
  },
  {
    q: 'Flag compiler "-fno-stack-protector" có tác dụng gì?',
    opts: [
      "Tăng tốc biên dịch",
      "Bật ASLR cho chương trình",
      "Vô hiệu hóa cơ chế bảo vệ Stack Canary",
      "Tắt tối ưu hóa code",
    ],
    answer: 2,
    explain:
      "Stack Canary là giá trị bí mật đặt giữa buffer và return address. Flag -fno-stack-protector tắt cơ chế này, cho phép Buffer Overflow thực sự ghi đè return address.",
  },
  {
    q: 'Trong thí nghiệm, payload "A×20 + B×20 + C×10" ghi đè Return Address bằng gì?',
    opts: ["0x41414141", "0x42424242", "0x43434343", "0x00000000"],
    answer: 2,
    explain:
      "Ký tự 'C' có mã ASCII = 0x43. 4 ký tự 'C' liên tiếp khi ghi vào Return Address (4 bytes) tạo thành giá trị 0x43434343.",
  },
  {
    q: "Hàm nào là cách thay thế AN TOÀN cho gets()?",
    opts: [
      "scanf()",
      "gets_s()",
      "fgets(buffer, sizeof(buffer), stdin)",
      "read()",
    ],
    answer: 2,
    explain:
      "fgets(buffer, n, stdin) đọc tối đa n-1 ký tự, đảm bảo không tràn buffer. Đây là lựa chọn an toàn nhất để thay thế gets().",
  },
  {
    q: "ASLR (Address Space Layout Randomization) bảo vệ chương trình như thế nào?",
    opts: [
      "Mã hóa toàn bộ bộ nhớ",
      "Ngẫu nhiên hóa địa chỉ của stack/heap/library mỗi lần chạy",
      "Kiểm tra kích thước input trước khi ghi",
      "Tắt quyền đọc vùng stack",
    ],
    answer: 1,
    explain:
      "ASLR làm cho các địa chỉ bộ nhớ thay đổi ngẫu nhiên mỗi lần chương trình chạy, khiến kẻ tấn công không thể đoán được địa chỉ cần ghi đè.",
  },
  {
    q: "Sau khi Buffer Overflow ghi đè 0x43434343 vào Return Address, điều gì xảy ra?",
    opts: [
      "Chương trình tiếp tục chạy bình thường",
      "CPU nhảy đến địa chỉ 0x43434343 — gây Segmentation Fault",
      "GDB tự động dừng chương trình",
      "Stack được khôi phục tự động",
    ],
    answer: 1,
    explain:
      "CPU sẽ nhảy đến địa chỉ 0x43434343 khi thực hiện lệnh ret. Đây không phải vùng nhớ hợp lệ chứa code, nên hệ điều hành gửi tín hiệu SIGSEGV → Segmentation Fault.",
  },
];

function initQuiz() {
  const container = document.getElementById("quiz-container");
  if (!container) return;

  QUESTIONS.forEach((q, qi) => {
    const qEl = document.createElement("div");
    qEl.className = "quiz-q";
    qEl.dataset.index = qi;

    const num = document.createElement("div");
    num.className = "quiz-q-num";
    num.textContent = `Câu ${qi + 1} / ${QUESTIONS.length}`;
    qEl.appendChild(num);

    const text = document.createElement("div");
    text.className = "quiz-q-text";
    text.textContent = q.q;
    qEl.appendChild(text);

    const opts = document.createElement("div");
    opts.className = "quiz-options";

    q.opts.forEach((opt, oi) => {
      const label = document.createElement("label");
      label.className = "quiz-option";
      label.innerHTML = `<input type="radio" name="q${qi}" value="${oi}" />${opt}`;
      opts.appendChild(label);
    });
    qEl.appendChild(opts);
    container.appendChild(qEl);
  });

  document.getElementById("submitQuiz")?.addEventListener("click", gradeQuiz);
}

function gradeQuiz() {
  let correct = 0;
  const container = document.getElementById("quiz-container");
  const resultEl = document.getElementById("quiz-result");

  QUESTIONS.forEach((q, qi) => {
    const qEl = container.querySelector(`[data-index="${qi}"]`);
    const selected = qEl.querySelector(`input[name="q${qi}"]:checked`);
    const options = qEl.querySelectorAll(".quiz-option");

    options.forEach((opt, oi) => {
      opt.classList.remove("correct", "wrong");
      if (oi === q.answer) opt.classList.add("correct");
    });

    if (selected) {
      const val = parseInt(selected.value);
      if (val === q.answer) {
        correct++;
      } else {
        options[val].classList.add("wrong");
      }
    }

    // Add explanation
    const existing = qEl.querySelector(".quiz-explain");
    if (existing) existing.remove();
    const explain = document.createElement("div");
    explain.className = "quiz-explain info-box";
    explain.style.marginTop = "12px";
    explain.innerHTML = `💡 <strong>Giải thích:</strong> ${q.explain}`;
    qEl.appendChild(explain);
  });

  resultEl.classList.remove("hidden");
  const pct = Math.round((correct / QUESTIONS.length) * 100);
  let grade, emoji;
  if (pct >= 90) {
    grade = "Xuất sắc! 🏆";
  } else if (pct >= 75) {
    grade = "Tốt! 👍";
  } else if (pct >= 50) {
    grade = "Cần ôn thêm 📚";
  } else {
    grade = "Hãy đọc lại bài 🔄";
  }

  resultEl.style.color =
    pct >= 75 ? "#7ee787" : pct >= 50 ? "#e3bb60" : "#ff7b72";
  resultEl.style.borderColor =
    pct >= 75
      ? "rgba(63,185,80,0.4)"
      : pct >= 50
        ? "rgba(210,153,34,0.4)"
        : "rgba(248,81,73,0.4)";
  resultEl.innerHTML = `
    <div style="font-size:2.5rem;margin-bottom:8px;">${pct >= 90 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "📚" : "🔄"}</div>
    <div>Điểm số: <strong>${correct} / ${QUESTIONS.length}</strong> (${pct}%)</div>
    <div style="font-size:0.95rem;margin-top:6px;">${grade}</div>
  `;

  resultEl.scrollIntoView({ behavior: "smooth", block: "center" });

  // Update submit button
  const btn = document.getElementById("submitQuiz");
  if (btn) {
    btn.textContent = "Làm Lại";
    btn.onclick = () => {
      location.reload();
    };
  }
}
