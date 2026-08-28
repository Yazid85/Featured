  (function () {
  const config = window.viCfg || {};
  if (!config.firebaseUrl) {
    console.warn("aDva: firebaseUrl belum diatur.");
    return;
  }

  const baseUrl = config.firebaseUrl.replace(/\/$/, "");
  const maxClaps = config.maxClaps || 50;

  // Penentuan ID Pos (Otomatis dari data-id atau URL pathname)
  const viewStaticEl = document.querySelector(".viewC");
  const viewEl = document.getElementById("vTc");
  const clapEl = document.getElementById("clapTotalCount");
  const clapBtn = document.getElementById("cBt");
  const toastEl = document.getElementById("nTf");
  const toastText = document.getElementById("toastTextContent");

  const cleanPath = window.location.pathname.replace(/\/$/, "");
  const fallbackId = cleanPath ? cleanPath.replace(/[^a-zA-Z0-9]/g, "_") : "homepage";
  const postId = (viewStaticEl && viewStaticEl.getAttribute("data-id")) || fallbackId;

  const endpoint = `${baseUrl}/posts/${postId}.json`;
  let currentGlobalClaps = 0;
  let toastTimeout = null;

  // Format Angka (1K, 1M)
  function formatNum(num) {
    if (config.abbreviation === "0") return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  // 1. Efek Scroll Tombol Floating
  if (clapBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 150) {
        clapBtn.classList.add("visible");
      } else {
        clapBtn.classList.remove("visible");
      }
    });
  }

  // 2. Realtime Listener Tanpa SDK (Menggunakan Native EventSource)
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

  // 3. Logika Incremental View Count (SessionStorage)
  const sessionViewKey = "apmody_viewed_" + postId;
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
  const userClapKey = "apmody_claps_" + postId;
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
      showToast(`Clap <span>+${userClapsGiven}</span>`, 1500);
    } else {
      showToast(`Mencapai batas <span>${maxClaps} claps</span>!`, 2000);
    }
  };

  function showParticle() {
    if (!clapBtn) return;
    const particle = document.createElement("div");
    particle.className = "clap-particle";
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
