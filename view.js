(function () {
  const config = window.aDcnfg || {};
  const firebaseUrl = config.firebaseUrl || "https://like-viewcnt-default-rtdb.asia-southeast1.firebasedatabase.app";
  const maxClaps = config.maxClaps || 50;
  const toastClapTpl = config.toastClapText || 'Clap <span>+{count}</span>';
  const toastMaxTpl = config.toastMaxText || 'Mencapai batas <span>{max} claps</span>!';

  // Format Angka (1K, 1M)
  function formatNum(num) {
    num = Number(num) || 0;
    if (config.abbreviation === "0") return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  function initWidget() {
    if (typeof firebase === "undefined") {
      console.error("aDcnfg: Firebase SDK belum dimuat.");
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp({ databaseURL: firebaseUrl });
    }
    const db = firebase.database();

    // Penentuan ID Post
    const viewStaticEl = document.querySelector(".aDv");
    const attrId = viewStaticEl ? viewStaticEl.getAttribute("data-id") : null;
    const cleanPath = window.location.pathname.replace(/\/$/, "").replace(/^\//, "");
    const fallbackId = cleanPath ? cleanPath.replace(/[^a-zA-Z0-9_-]/g, "_") : "homepage";
    const postId = (attrId && attrId !== "undefined" && attrId.trim() !== "") 
      ? attrId.replace(/[^a-zA-Z0-9_-]/g, "_") 
      : fallbackId;

    const clapRef = db.ref("posts/" + postId + "/claps");
    const viewRef = db.ref("posts/" + postId + "/views");

    const clapTotalEl = document.getElementById("aDcTotal");
    const viewTotalEl = document.getElementById("aDvTotal");
    const toastEl = document.getElementById("aDt");
    const toastTextContent = document.getElementById("aDtText");
    const clapBtnElement = document.getElementById("aDcBtn");

    let userClapKey = "aDc_claps_" + postId;
    let userClapsGiven = parseInt(localStorage.getItem(userClapKey)) || 0;
    let toastTimeout = null;
    let currentGlobalClaps = 0;

    // Scroll Handler (Otomatis tampil jika halaman pendek)
    function checkScroll() {
      if (!clapBtnElement) return;
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const isShortPage = document.documentElement.scrollHeight <= window.innerHeight + 50;
      if (scrollPos > 20 || isShortPage) {
        clapBtnElement.classList.add("visible");
      } else {
        clapBtnElement.classList.remove("visible");
      }
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    checkScroll();

    // Realtime Listener & Transaction View Count
    let sessionViewKey = "aDv_viewed_" + postId;
    if (!sessionStorage.getItem(sessionViewKey)) {
      sessionStorage.setItem(sessionViewKey, "true");
      viewRef.transaction(currentViews => (currentViews || 0) + 1);
    }

    viewRef.on("value", snapshot => {
      let totalViews = snapshot.val() || 0;
      if (viewTotalEl) viewTotalEl.innerText = formatNum(totalViews);
    });

    // Realtime Listener Clap
    clapRef.on("value", snapshot => {
      currentGlobalClaps = snapshot.val() || 0;
      if (clapTotalEl) clapTotalEl.innerText = formatNum(currentGlobalClaps);
    });

    // Trigger Clap Button
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
      particle.className = "aDc-particle";
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();
