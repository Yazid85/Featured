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

  const viewStaticEl = document.querySelector(".aDv");
  const viewEl = document.getElementById("aDvTotal");
  const clapEl = document.getElementById("aDcTotal");
  const clapBtn = document.getElementById("aDcBtn");
  const toastEl = document.getElementById("aDt");
  const toastText = document.getElementById("aDtText");

  const cleanPath = window.location.pathname.replace(/\/$/, "");
  const fallbackId = cleanPath ? cleanPath.replace(/[^a-zA-Z0-9]/g, "_") : "homepage";
  const postId = (viewStaticEl && viewStaticEl.getAttribute("data-id")) || fallbackId;

  const endpoint = `${baseUrl}/posts/${postId}.json`;
  let currentGlobalClaps = 0;
  let toastTimeout = null;

  function formatNum(num) {
    if (config.abbreviation === "0") return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  // 1. Scroll Effect Floating Clap Button
  if (clapBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 150) {
        clapBtn.classList.add("visible");
      } else {
        clapBtn.classList.remove("visible");
      }
    }, { passive: true });
  }

  // 2. Realtime EventSource Listener (Native Browser)
  if (typeof EventSource !== "undefined") {
    const evSource = new EventSource(endpoint);
    evSource.onmessage = function (event) {
      const res = JSON.parse(event.data);
      if (res && res.data) {
        if (viewEl && res.data.views !== undefined) viewEl.innerText = formatNum(res.data.views);
        if (clapEl && res.data.claps !== undefined) {
          currentGlobalClaps = res.data.claps;
          clapEl.innerText = formatNum(currentGlobalClaps);
        }
      }
    };
  }

  // 3. Logika Incremental View Count (sessionStorage)
  const sessionViewKey = "aDv_viewed_" + postId;
  if (!sessionStorage.getItem(sessionViewKey)) {
    sessionStorage.setItem(sessionViewKey, "true");
    fetch(`${baseUrl}/posts/${postId}/views.json`)
      .then(res => res.json())
      .then(views => {
        const newViews = (views || 0) + 1;
        fetch(`${baseUrl}/posts/${postId}/views.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newViews)
        }).then(() => {
          if (viewEl) viewEl.innerText = formatNum(newViews);
        });
      })
      .catch(err => console.error("View Count Error:", err));
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
    if (!clapBtn) return;
    const particle = document.createElement("div");
    particle.className = "aDc-particle";
    particle.innerText = "+1";
    clapBtn.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }

  function showToast(htmlContent, duration) {
    if (!toastEl || !toastText) return;
    toastText.innerHTML = htmlContent;
    toastEl.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove("show"), duration);
  }
})();
