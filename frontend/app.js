(() => {
  const messagesEl    = document.getElementById("messages");
  const chatContainer = document.getElementById("chat-container");
  const outputPanel   = document.getElementById("output-panel");
  const outputEmpty   = document.getElementById("output-empty");
  const inputEl       = document.getElementById("user-input");
  const sendBtn       = document.getElementById("btn-send");
  const newSessBtn    = document.getElementById("btn-new-session");
  const wsStatus      = document.getElementById("ws-status");
  const wsText        = document.getElementById("ws-text");
  const emptyState    = document.getElementById("empty-state");
  const stepLabelMobile = document.getElementById("step-label-mobile");
  const keyModal      = document.getElementById("key-modal");
  const keyInput      = document.getElementById("key-input");
  const keySubmit     = document.getElementById("key-submit");
  const keyError      = document.getElementById("key-error");

  let ws = null;
  let sessionId = null;
  let isProcessing = false;
  let currentThinkingBubble = null;
  let upstageApiKey = "";

  // ── Step timer ─────────────────────────────────────────────────────────────

  let processingTimer = null;
  let stepStartTime = null;
  let currentNodeLabel = "";
  let currentRevision = 0;
  let currentMaxRevisions = 3;

  function startStepTimer(label, revision, maxRevisions) {
    currentNodeLabel = label;
    currentRevision = revision || 0;
    currentMaxRevisions = maxRevisions || 3;
    stepStartTime = Date.now();
    updateThinkingText();
    if (processingTimer) clearInterval(processingTimer);
    processingTimer = setInterval(updateThinkingText, 1000);
  }

  function stopStepTimer() {
    if (processingTimer) {
      clearInterval(processingTimer);
      processingTimer = null;
    }
  }

  function updateThinkingText() {
    if (!currentThinkingBubble) return;
    const textEl = currentThinkingBubble.querySelector(".thinking-text");
    if (!textEl) return;
    const elapsed = stepStartTime ? Math.floor((Date.now() - stepStartTime) / 1000) : 0;
    const parts = [currentNodeLabel];
    if (currentRevision > 0) parts.push(`개선 ${currentRevision}/${currentMaxRevisions}`);
    parts.push(`${elapsed}s`);
    textEl.textContent = parts.join("  ·  ");
  }

  // ── Node progress helpers ──────────────────────────────────────────────────

  const nodeSteps = document.querySelectorAll(".node-step");

  const nodeLabelMap = {
    analyze_input:  "분석 중",
    ask_user:       "정보 요청 중",
    write_draft:    "초안 작성 중",
    evaluate:       "평가 중",
    give_output:    "완성 중",
  };

  function resetProgressBar() {
    nodeSteps.forEach(el => el.classList.remove("active", "done"));
    if (stepLabelMobile) stepLabelMobile.textContent = "";
  }

  function setNodeActive(name, revision, maxRevisions) {
    nodeSteps.forEach(el => {
      if (el.dataset.node === name) {
        el.classList.add("active");
        el.classList.remove("done");
        if (stepLabelMobile) stepLabelMobile.textContent = nodeLabelMap[name] || name;
      }
    });
    showThinkingIndicator();
    startStepTimer(nodeLabelMap[name] || name, revision, maxRevisions);
  }

  function setNodeDone(name) {
    nodeSteps.forEach(el => {
      if (el.dataset.node === name) {
        el.classList.remove("active");
        el.classList.add("done");
      }
    });
  }

  // ── Chat rendering ─────────────────────────────────────────────────────────

  function appendBubble(role, text) {
    if (emptyState && emptyState.style.display !== "none") {
      emptyState.style.display = "none";
    }

    const wrap = document.createElement("div");
    wrap.className = `bubble-wrap ${role} bubble-enter`;

    if (role === "agent") {
      const label = document.createElement("div");
      label.className = "agent-label";
      label.textContent = "AI";
      wrap.appendChild(label);
    }

    const bub = document.createElement("div");
    bub.className = "bubble";
    bub.textContent = text;
    wrap.appendChild(bub);

    if (currentThinkingBubble) {
      messagesEl.insertBefore(wrap, currentThinkingBubble);
    } else {
      messagesEl.appendChild(wrap);
    }

    scrollToBottom();
    return bub;
  }

  function showThinkingIndicator() {
    if (currentThinkingBubble) return;

    const wrap = document.createElement("div");
    wrap.className = "bubble-wrap agent bubble-enter";

    const label = document.createElement("div");
    label.className = "agent-label";
    label.textContent = "AI";
    wrap.appendChild(label);

    const bub = document.createElement("div");
    bub.className = "thinking-text";
    bub.textContent = currentNodeLabel || "···";
    wrap.appendChild(bub);

    messagesEl.appendChild(wrap);
    currentThinkingBubble = wrap;
    scrollToBottom();
  }

  function removeThinkingIndicator() {
    if (currentThinkingBubble) {
      currentThinkingBubble.remove();
      currentThinkingBubble = null;
    }
  }

  function appendFinalPrompt(text) {
    removeThinkingIndicator();

    // Clear output panel, remove empty state
    if (outputEmpty) outputEmpty.style.display = "none";
    // Remove any previous card
    const prev = outputPanel.querySelector(".final-prompt-card");
    if (prev) prev.remove();

    const card = document.createElement("div");
    card.className = "final-prompt-card";

    const label = document.createElement("div");
    label.className = "fp-label";
    label.textContent = "GENERATED PROMPT";

    const pre = document.createElement("pre");
    pre.className = "fp-code";
    pre.textContent = text;

    const copyBtn = document.createElement("button");
    copyBtn.className = "btn-copy";
    copyBtn.setAttribute("aria-label", "복사");
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="5" width="8" height="10" rx="1.5"/>
        <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v7A1.5 1.5 0 0 0 3.5 12H5"/>
      </svg>`;

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.classList.add("copied");
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2.5 8.5l4 4 7-8"/>
          </svg>`;
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="5" y="5" width="8" height="10" rx="1.5"/>
              <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v7A1.5 1.5 0 0 0 3.5 12H5"/>
            </svg>`;
        }, 2000);
      });
    });

    card.appendChild(copyBtn);
    card.appendChild(label);
    card.appendChild(pre);
    outputPanel.appendChild(card);
  }

  function clearMessages() {
    messagesEl.innerHTML = "";
    currentThinkingBubble = null;
    if (emptyState) {
      emptyState.style.display = "flex";
      messagesEl.appendChild(emptyState);
    }
    // Reset right panel
    const prev = outputPanel.querySelector(".final-prompt-card");
    if (prev) prev.remove();
    if (outputEmpty) outputEmpty.style.display = "flex";
  }

  function scrollToBottom() {
    const isNearBottom =
      chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 120;
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: isNearBottom ? "smooth" : "auto",
    });
  }

  // ── Session & WebSocket ────────────────────────────────────────────────────

  async function initSession() {
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: upstageApiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        showKeyError(data.error || "API 키 확인에 실패했습니다.");
        return;
      }
      sessionId = data.session_id;
      keyModal.classList.add("hidden");
      connectWebSocket();
    } catch (e) {
      showKeyError("서버 연결에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  function setWsStatus(status) {
    wsStatus.className = `ws-status ws-${status}`;
    const labels = { connected: "연결됨", connecting: "연결 중", disconnected: "연결 끊김" };
    if (wsText) wsText.textContent = labels[status] || status;
  }

  function connectWebSocket() {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    setWsStatus("connecting");
    ws = new WebSocket(`${proto}://${location.host}/ws/${sessionId}`);

    ws.addEventListener("open", () => {
      setInputEnabled(true);
      setWsStatus("connected");
    });

    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      handleServerMessage(msg);
    });

    ws.addEventListener("close", () => {
      setInputEnabled(false);
      setWsStatus("disconnected");
      appendBubble("error", "연결이 끊어졌습니다. 페이지를 새로고침 해주세요.");
    });

    ws.addEventListener("error", () => {
      setWsStatus("disconnected");
      appendBubble("error", "WebSocket 연결 오류가 발생했습니다.");
    });
  }

  function handleServerMessage(msg) {
    switch (msg.type) {
      case "node_start":
        setNodeActive(msg.node, msg.revision, msg.max_revisions);
        break;

      case "node_end":
        setNodeDone(msg.node);
        break;

      case "ai_message":
        removeThinkingIndicator();
        appendBubble("agent", msg.content);
        break;

      case "final_prompt":
        removeThinkingIndicator();
        appendFinalPrompt(msg.content);
        setProcessing(false);
        nodeSteps.forEach(el => {
          el.classList.remove("active");
          el.classList.add("done");
        });
        if (stepLabelMobile) stepLabelMobile.textContent = "완성";
        break;

      case "session_reset":
        clearMessages();
        resetProgressBar();
        setProcessing(false);
        appendBubble("agent", "새 세션이 시작되었습니다. 어떤 프롬프트를 만들어 드릴까요?");
        break;

      case "error":
        removeThinkingIndicator();
        appendBubble("error", `오류: ${msg.message}`);
        setProcessing(false);
        break;
    }
  }

  // ── Input control ──────────────────────────────────────────────────────────

  function setInputEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
  }

  function setProcessing(processing) {
    isProcessing = processing;
    sendBtn.disabled = processing;
    sendBtn.classList.toggle("processing", processing);
    if (!processing) stopStepTimer();
  }

  // ── Send message ───────────────────────────────────────────────────────────

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isProcessing || !ws || ws.readyState !== WebSocket.OPEN) return;

    resetProgressBar();
    appendBubble("user", text);
    inputEl.value = "";
    inputEl.style.height = "auto";
    setProcessing(true);
    currentRevision = 0;
    currentNodeLabel = "준비 중";
    showThinkingIndicator();
    startStepTimer("준비 중");

    ws.send(JSON.stringify({ type: "user_message", content: text }));
  }

  sendBtn.addEventListener("click", sendMessage);

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea up to 140px
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = `${Math.min(inputEl.scrollHeight, 140)}px`;
  });

  // ── New session button ─────────────────────────────────────────────────────

  newSessBtn.addEventListener("click", async () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "reset" }));
    } else {
      if (ws) ws.close();
      clearMessages();
      resetProgressBar();
      await initSession();
    }
  });

  // ── API Key Modal ──────────────────────────────────────────────────────────

  function showKeyError(msg) {
    keyError.textContent = msg;
    keyError.style.display = "block";
    keySubmit.disabled = false;
    keySubmit.textContent = "시작하기";
  }

  function submitKey() {
    const key = keyInput.value.trim();
    if (!key) return;
    keyError.style.display = "none";
    keySubmit.disabled = true;
    keySubmit.textContent = "확인 중…";
    upstageApiKey = key;
    initSession();
  }

  keySubmit.addEventListener("click", submitKey);
  keyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitKey();
  });

  // ── Boot ──────────────────────────────────────────────────────────────────

  setInputEnabled(false);
  // Show modal first — initSession() is called after key is submitted
})();
