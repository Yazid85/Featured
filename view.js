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

  // 1. Konsistensi Penentuan Post ID
  function getPostId() {
    const viewStaticEl = document.querySelector(".aDv");
    const attrId = viewStaticEl ? viewStaticEl.getAttribute("data-id") : null;
    if (attrId && attrId.trim() !== "" && attrId !== "undefined") {
      return attrId.replace(/[^a-zA-Z0-9_-]/g, "_");
    }
    const cleanPath = window.location.pathname.replace(/\/$/, "");
    return cleanPath ? cleanPath.replace(/[^a-zA-Z0-9_-]/g, "_") : "homepage";
  }

  const postId = getPostId();
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

  function updateUI(views, claps) {
    const viewEl = document.getElementById("aDvTotal");
    const clapEl = document.getElementById("aDcTotal");
    if (viewEl && views !== undefined && views !== null) viewEl.innerText = formatNum(views);
    if (clapEl && claps !== undefined && claps !== null) {
      currentGlobalClaps = claps;
      clapEl.innerText = formatNum(claps);
    }
  }

  // 2. Multi-Fallback Scroll Detection
  function checkScroll() {
    const btn = document.getElementById("aDcBtn");
    if (!btn) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollTop > 40) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", checkScroll, { passive: true });
  document.addEventListener("scroll", checkScroll, { passive: true });

  // 3. Trigger Clap Handler
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
      updateUI(null, currentGlobalClaps);

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
    const btn = document.getElementById("aDcBtn");
    if (!btn) return;
    const particle = document.createElement("div");
    particle.className = "aDc-particle";
    particle.innerText = "+1";
    btn.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }

  function showToast(htmlContent, duration) {
    const toastEl = document.getElementById("aDt");
    const toastText = document.getElementById("aDtText");
    if (!toastEl || !toastText) return;
    toastText.innerHTML = htmlContent;
    toastEl.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove("show"), duration);
  }

  // 4. Inisialisasi Utama
  function initWidget() {
    checkScroll();

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        let views = (data && typeof data.views === 'number') ? data.views : 0;
        let claps = (data && typeof data.claps === 'number') ? data.claps : 0;

        updateUI(views, claps);

        const sessionViewKey = "aDv_viewed_" + postId;
        if (!sessionStorage.getItem(sessionViewKey)) {
          sessionStorage.setItem(sessionViewKey, "true");
          views += 1;

          fetch(`${baseUrl}/posts/${postId}/views.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(views)
          })
          .then(r => r.json())
          .then(updatedViews => {
            if (typeof updatedViews === 'number') updateUI(updatedViews, null);
          });
        }
      })
      .catch(err => console.error("Firebase fetch error:", err));

    // 5. Firebase Realtime Event Listener ('put' & 'patch')
    if (typeof EventSource !== "undefined") {
      try {
        const evSource = new EventSource(endpoint);
        const handleSSE = function (event) {
          const res = JSON.parse(event.data);
          if (!res) return;
          if (res.path === "/") {
            if (res.data) updateUI(res.data.views, res.data.claps);
          } else if (res.path === "/views") {
            updateUI(res.data, null);
          } else if (res.path === "/claps") {
            updateUI(null, res.data);
          }
        };

        evSource.addEventListener("put", handleSSE);
        evSource.addEventListener("patch", handleSSE);
      } catch (e) {
        console.warn("SSE Error:", e);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();
