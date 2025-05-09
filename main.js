// 抓取按鈕與 sidebar 元素
const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");

// 點擊按鈕時切換顯示/隱藏 sidebar
if (toggleBtn && sidebar) {
  toggleBtn.addEventListener("click", () => {
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
  });
}

// ===== 聯絡我表單驗證 + 留言系統（含 localStorage、刪除、時間） =====
const form = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const forum = document.getElementById("forumMessages");

// 取得本地留言資料（如果有）
function loadMessages() {
  const saved = localStorage.getItem("forumMessages");
  return saved ? JSON.parse(saved) : [];
}

// 儲存留言至 localStorage
function saveMessages(messages) {
  localStorage.setItem("forumMessages", JSON.stringify(messages));
}

// 渲染留言清單
function renderMessages() {
  forum.innerHTML = ""; // 清空畫面
  const messages = loadMessages().reverse(); // 最新在最上面

  messages.forEach((msg, index) => {
    const entry = document.createElement("div");
    entry.classList.add("message-card");

    entry.innerHTML = `
      <p><strong>${msg.name}</strong> 說：</p>
      <p>${msg.message}</p>
      <p class="timestamp">${msg.time}</p>
      <button class="delete-btn" data-index="${index}">刪除</button>
      <hr />
    `;

    forum.appendChild(entry);
  });

  // 綁定刪除功能
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      const messages = loadMessages();
      messages.splice(messages.length - 1 - index, 1); // 保證刪的是正確順序
      saveMessages(messages);
      renderMessages();
    });
  });
}

// 送出表單處理
if (form && nameInput && emailInput && messageInput && forum) {
  renderMessages(); // 初始渲染

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    nameError.textContent = "";
    emailError.textContent = "";

    let hasError = false;
    if (nameInput.value.trim() === "") {
      nameError.textContent = "請輸入名字";
      hasError = true;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailError.textContent = "請輸入正確的 Email";
      hasError = true;
    }

    if (hasError) return;

    // 組裝留言資料
    const now = new Date();
    const time = now.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      name: nameInput.value.trim(),
      message: messageInput.value.trim(),
      time,
    };

    // 儲存並更新畫面
    const messages = loadMessages();
    messages.push(newMessage);
    saveMessages(messages);
    renderMessages();

    // 清空輸入
    nameInput.value = "";
    emailInput.value = "";
    messageInput.value = "";
  });
}

// ===== 旋轉作品圖自動排列 =====
const carousel = document.getElementById("carousel");

let focusedIndex = null; // 被滑鼠碰到的那張圖

if (carousel) {
  const imgs = carousel.querySelectorAll("img");
  const len = imgs.length;
  const radius = 600; // 與機器人寬度 (200px) 相近，會環繞經過正前方
  const yOffset = -20;
  const centerZ = 200;

  let rotation = 0;

  function positionImages(angleOffset = 0) {
    let closestImg = null;
    let closestAngle = 9999;

    imgs.forEach((img, i) => {
      const angleDeg = (360 / len) * i + angleOffset;
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = Math.cos(angleRad) * radius;
      const z = Math.sin(angleRad) * radius;

      let baseTransform = `
        rotateY(${angleDeg}deg)
        translateZ(${radius}px)
        rotateY(${-angleDeg}deg)
        translateY(${yOffset}px)
      `;

      img.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      img.style.transform = baseTransform;
      img.style.zIndex = Math.round(z);

      // 找最靠近正前方的圖片
      const normalized = Math.abs(((angleDeg + 360) % 360) - 180);
      if (normalized < closestAngle) {
        closestAngle = normalized;
        closestImg = img;
      }
    });

    // ✅ 放大正前方圖片
    if (closestImg) {
      closestImg.style.transform += " scale(2)";
      closestImg.style.zIndex = 999;
    }
  }

  function animate() {
    if (!isPaused) {
      rotation += 0.5;
      positionImages(rotation);
    }
    requestAnimationFrame(animate);
  }
  let isPaused = false;

  carousel.addEventListener("mouseenter", () => {
    isPaused = true;
  });
  carousel.addEventListener("mouseleave", () => {
    isPaused = false;
  });

  animate(); // 啟動旋轉動畫
}
