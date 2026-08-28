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

  function formatNum(num) {
    num = Number(num) || 0;
    if (config.abbreviation === "0") return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  function initWidget() {
    const viewStaticEl = document.querySelector(".aDv");
    const cleanPath = window.location.pathname.replace(/\/$/, "");
    const fallbackId = cleanPath ? cleanPath.replace(/[^a-zA-Z0-9]/g, "_") : "homepage";
    const postId = (viewStaticEl && viewStaticEl.getAttribute("data-id")) || fallbackId;

    const endpoint = `${baseUrl}/posts/${postId}.json`;
    let currentGlobalClaps = 0;
    let toastTimeout = null;

    const viewEl = document.getElementById("aDvTotal");
    const clapEl = document.getElementById("aDcTotal");
    const toastEl = document.getElementById("aDt");
    const toastText = document.getElementById("aDtText");

    // 1. Scroll Handler (Selalu Aktif)
    function checkScroll() {
      const btn = document.getElementById("aDcBtn");
      if (!btn) return;
      const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollPos > 100) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    // 2. Fetch Data View & Clap dari Firebase
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error("Firebase HTTP status: " + res.status);
        return res.json();
      })
      .then(data => {
        let views = (data && typeof data.views === 'number') ? data.views : 0;
        currentGlobalClaps = (data && typeof data.claps === 'number') ? data.claps : 0;

        if (viewEl) viewEl.innerText = formatNum(views);
        if (clapEl) clapEl.innerText = formatNum(currentGlobalClaps);

        // Tambah View jika belum ada di SessionStorage
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
            if (viewEl) viewEl.innerText = formatNum(updatedViews);
          })
          .catch(err => console.error("Update view error:", err));
        }
      })
      .catch(err => console.error("Fetch Firebase error:", err));

    // 3. Realtime Listener (EventSource)
    if (typeof EventSource !== "undefined") {
      try {
        const evSource = new EventSource(endpoint);
        evSource.onmessage = function (event) {
          const res = JSON.parse(event.data);
          if (!res) return;

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
      } catch(e) { console.warn("EventSource error:", e); }
    }

    // 4. Logika Trigger Clap
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
      const btn = document.getElementById("aDcBtn");
      if (!btn) return;
      const particle = document.createElement("div");
      particle.className = "aDc-particle";
      particle.innerText = "+1";
      btn.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }

    function showToast(htmlContent, duration) {
      if (!toastEl || !toastText) return;
      toastText.innerHTML = htmlContent;
      toastEl.classList.add("show");
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toastEl.classList.remove("show"), duration);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();
