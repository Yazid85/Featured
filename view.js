(function () {
  const config = window.aDcnfg || {};
  const maxClaps = config.maxClaps || 50;
  const toastClapTpl = config.toastClapText || 'Clap <span>+{count}</span>';
  const toastMaxTpl = config.toastMaxText || 'Mencapai batas <span>{max} claps</span>!';

  // Format Angka Shortener (1K, 1M)
  function formatNum(num) {
    num = Number(num) || 0;
    if (config.abbreviation === "0") return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  // Muat Firebase SDK Otomatis Jika Belum Ada
  function ensureFirebase(callback) {
    if (window.firebase && window.firebase.database) {
      callback();
      return;
    }
    const appScript = document.createElement("script");
    appScript.src = "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js";
    appScript.onload = function () {
      const dbScript = document.createElement("script");
      dbScript.src = "https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js";
      dbScript.onload = callback;
      document.head.appendChild(dbScript);
    };
    document.head.appendChild(appScript);
  }

  function initWidget() {
    const firebaseConfig = config.firebaseConfig || {
      apiKey: "AIzaSyD7PahP7tTQGor7HRJv64UZLSk0V9L-PR0",
      authDomain: "like-viewcnt.firebaseapp.com",
      databaseURL: config.firebaseUrl || "https://like-viewcnt-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "like-viewcnt"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // Deteksi ID Post (Blogger ID atau Clean Path URL)
    function getPostId() {
      const el = document.querySelector(".apmody-view-static") || document.querySelector(".aDv");
      const attrId = el ? el.getAttribute("data-id") : null;
      if (attrId && attrId !== "undefined" && attrId !== "null" && attrId.trim() !== "") {
        return attrId.replace(/[^a-zA-Z0-9_-]/g, "_");
      }
      const cleanPath = window.location.pathname.replace(/\/$/, "").replace(/^\//, "");
      return cleanPath ? cleanPath.replace(/[^a-zA-Z0-9_-]/g, "_") : "homepage";
    }

    const postId = getPostId();
    const clapRef = db.ref("posts/" + postId + "/claps");
    const viewRef = db.ref("posts/" + postId + "/views");

    const clapTotalEl = document.getElementById("clapTotalCount") || document.getElementById("aDcTotal");
    const viewTotalEl = document.getElementById("viewTotalCount") || document.getElementById("aDvTotal");
    const toastEl = document.getElementById("apmodyToast") || document.getElementById("aDt");
    const toastTextContent = document.getElementById("toastTextContent") || document.getElementById("aDtText");
    const clapBtnElement = document.getElementById("apmodyClapBtn") || document.getElementById("aDcBtn");

    let userClapKey = "apmody_claps_" + postId;
    let userClapsGiven = parseInt(localStorage.getItem(userClapKey)) || 0;
    let toastTimeout = null;
    let currentGlobalClaps = 0;

    // Scroll & Window Check (Muncul Otomatis jika Halaman Pendek)
    function checkScroll() {
      if (!clapBtnElement) return;
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop || 0;
      const isShortPage = document.documentElement.scrollHeight <= window.innerHeight + 50;
      if (scrollPos > 30 || isShortPage) {
        clapBtnElement.classList.add("visible");
      } else {
        clapBtnElement.classList.remove("visible");
      }
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    checkScroll();

    // Increment View Count (Per Sesi Browser)
    const sessionViewKey = "apmody_viewed_" + postId;
    if (!sessionStorage.getItem(sessionViewKey)) {
      sessionStorage.setItem(sessionViewKey, "true");
      viewRef.transaction(currentViews => (currentViews || 0) + 1);
    }

    // Realtime Listener Views & Claps
    viewRef.on("value", snapshot => {
      const totalViews = snapshot.val() || 0;
      if (viewTotalEl) viewTotalEl.innerText = formatNum(totalViews);
    });

    clapRef.on("value", snapshot => {
      currentGlobalClaps = snapshot.val() || 0;
      if (clapTotalEl) clapTotalEl.innerText = formatNum(currentGlobalClaps);
    });

    // Daftarkan triggerClap ke window agar onclick="triggerClap()" berjalan
    window.triggerClap = function () {
      if (userClapsGiven >= currentGlobalClaps) {
        userClapsGiven = currentGlobalClaps;
      }

      if (userClapsGiven < maxClaps) {
        userClapsGiven++;
        localStorage.setItem(userClapKey, userClapsGiven);

        currentGlobalClaps++;
        if (clapTotalEl) clapTotalEl.innerText = formatNum(currentGlobalClaps);

        clapRef.transaction(currentClaps => (currentClaps || 0) + 1);

        showParticleEffect();
        showToast(toastClapTpl.replace('{count}', userClapsGiven), 1500);
      } else {
        showToast(toastMaxTpl.replace('{max}', maxClaps), 2000);
      }
    };

    function showParticleEffect() {
      if (!clapBtnElement) return;
      const particle = document.createElement("div");
      particle.className = "clap-particle";
      particle.innerText = "+1";
      clapBtnElement.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }

    function showToast(htmlContent, duration) {
      if (!toastEl || !toastTextContent) return;
      toastTextContent.innerHTML = htmlContent;
      toastEl.classList.add("show");
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toastEl.classList.remove("show"), duration);
    }
  }

  ensureFirebase(initWidget);
})();
