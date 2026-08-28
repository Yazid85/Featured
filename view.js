(function () {
  const config = window.aDcnfg || {};
  if (!config.firebaseUrl) {
    console.warn("aDcnfg: firebaseUrl belum diatur.");
    return;
  }

  const baseUrl = config.firebaseUrl.replace(/\/$/, "");
  const maxClaps = config.maxClaps || 50;

  const toastClapTpl = config.toastClapText || 'Clap <span>+{count}</span>';
  const toastMaxTpl = config.toastMaxText || 'Mencapai batas <span>{max} claps</span>!';

  const getViewStaticEl = () => document.querySelector(".aDv");
  const getViewEl = () => document.getElementById("aDvTotal");
  const getClapEl = () => document.getElementById("aDcTotal");
  const getClapBtn = () => document.getElementById("aDcBtn");
  const getToastEl = () => document.getElementById("aDt");
  const getToastText = () => document.getElementById("aDtText");

  const cleanPath = window.location.pathname.replace(/\/$/, "");
  const fallbackId = cleanPath ? cleanPath.replace(/[^a-zA-Z0-9]/g, "_") : "homepage";
  const viewStaticEl = getViewStaticEl();
  const postId = (viewStaticEl && viewStaticEl.getAttribute("data-id")) || fallbackId;

  const endpoint = `${baseUrl}/posts/${postId}.json`;
  let currentGlobalClaps = 0;
  let toastTimeout = null;

  function formatNum(num) {
    num = Number(num) || 0;
    if (config.abbreviation === "0") return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  // 1. Scroll Effect Floating Clap Button
  const clapBtn = getClapBtn();
  if (clapBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 150) {
        clapBtn.classList.add("visible");
      } else {
        clapBtn.classList.remove("visible");
      }
    }, { passive: true });
  }

  // 2. Fetch Initial Data & Logika Incremental View
  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      let views = (data && data.views) ? data.views : 0;
      currentGlobalClaps = (data && data.claps) ? data.claps : 0;

      const viewEl = getViewEl();
      const clapEl = getClapEl();
      if (viewEl) viewEl.innerText = formatNum(views);
      if (clapEl) clapEl.innerText = formatNum(currentGlobalClaps);

      // Tambah View jika belum tercatat di Session
      const sessionViewKey = "aDv_viewed_" + postId;
      if (!sessionStorage.getItem(sessionViewKey)) {
        sessionStorage.setItem(sessionViewKey, "true");
        views += 1;
        fetch(`${baseUrl}/posts/${postId}/views.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(views)
        }).then(() => {
          if (viewEl) viewEl.innerText = formatNum(views);
        }).catch(err => console.error("Error updating views:", err));
      }
    })
    .catch(err => console.error("Error fetching post data:", err));

  // 3. Realtime Listener EventSource (Handled Path Response)
  if (typeof EventSource !== "undefined") {
    const evSource = new EventSource(endpoint);
    evSource.onmessage = function (event) {
      const res = JSON.parse(event.data);
      if (!res) return;
      const viewEl = getViewEl();
      const clapEl = getClapEl();

      if (res.path === "/") {
        if (res.data) {
          if (viewEl && res.data.views !== undefined) viewEl.innerText = formatNum(res.data.views);
          if (clapEl && res.data.claps !== undefined) {
            currentGlobalClaps = res.data.claps;
            clapEl.innerText = formatNum(currentGlobalClaps);
          }
        }
      } else if (res.path === "/views") {
        if (viewEl && res.data !== undefined) viewEl.innerText = formatNum(res.data);
      } else if (res.path === "/claps") {
        if (clapEl && res.data !== undefined) {
          currentGlobalClaps = res.data;
          clapEl.innerText = formatNum(currentGlobalClaps);
        }
      }
    };
  }

  // 4. Logika Trigger Clap & Limit LocalStorage
  const userClapKey = "aDc_claps_" + postId;
  let userClapsGiven = parseInt(localStorage.getItem(userClapKey)) || 0;

  window.triggerClap = function () {
    if (userClapsGiven < currentGlobalClaps) {
      userClapsGiven = currentGlobalClaps;
    }

    if (userClapsGiven < maxClaps) {
      userClapsGiven++;
      localStorage.setItem(userClapKey, userClapsGiven);

      currentGlobalClaps++;
      const clapEl = getClapEl();
      if (clapEl) clapEl.innerText = formatNum(currentGlobalClaps);

      fetch(`${baseUrl}/posts/${postId}/claps.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentGlobalClaps)
      });

      showParticle();
      const clapMsg = toastClapTpl.replace('{count}', userClapsGiven);
      showToast(clapMsg, 1500);
    } else {
      const maxMsg = toastMaxTpl.replace('{max}', maxClaps);
      showToast(maxMsg, 2000);
    }
  };

  function showParticle() {
    const btn = getClapBtn();
    if (!btn) return;
    const particle = document.createElement("div");
    particle.className = "aDc-particle";
    particle.innerText = "+1";
    btn.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }

  function showToast(htmlContent, duration) {
    const toastEl = getToastEl();
    const toastText = getToastText();
    if (!toastEl || !toastText) return;
    toastText.innerHTML = htmlContent;
    toastEl.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove("show"), duration);
  }
})();
