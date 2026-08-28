(function () {
  const config = window.aDcnfg || {};
  const maxClaps = config.maxClaps || 50;
  const toastClapTpl = config.toastClapText || 'Clap <span>+{count}</span>';
  const toastMaxTpl = config.toastMaxText || 'You have reached the maximum limit of <span>{max} claps</span>!';

  function formatNum(num) {
    num = Number(num) || 0;
    if (config.abbreviation === "0") return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  function init() {
    const firebaseConfig = {
      apiKey: "AIzaSyD7PahP7tTQGor7HRJv64UZLSk0V9L-PR0",
      authDomain: "like-viewcnt.firebaseapp.com",
      databaseURL: config.firebaseUrl || "https://like-viewcnt-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "like-viewcnt"
    };

    if (window.firebase && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.database();
    let cleanPath = window.location.pathname.replace(/\/$/, "");
    let postId = cleanPath ? cleanPath.replace(/[^a-zA-Z0-9]/g, "_") : "homepage";

    const clapRef = db.ref("posts/" + postId + "/claps");
    const viewRef = db.ref("posts/" + postId + "/views");

    const clapTotalEl = document.getElementById("clapTotalCount");
    const viewTotalEl = document.getElementById("viewTotalCount");
    const toastEl = document.getElementById("apmodyToast");
    const toastTextContent = document.getElementById("toastTextContent");
    const clapBtnElement = document.getElementById("apmodyClapBtn");

    let userClapKey = "apmody_claps_" + postId;
    let userClapsGiven = parseInt(localStorage.getItem(userClapKey)) || 0;
    let toastTimeout = null;
    let currentGlobalClaps = 0;

    // Scroll Control
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

    // Logika View
    let sessionViewKey = "apmody_viewed_" + postId;
    if (!sessionStorage.getItem(sessionViewKey)) {
      sessionStorage.setItem(sessionViewKey, "true");
      viewRef.transaction(currentViews => (currentViews || 0) + 1);
    }

    // Listener Realtime
    viewRef.on("value", snapshot => {
      let totalViews = snapshot.val() || 0;
      if (viewTotalEl) viewTotalEl.innerText = formatNum(totalViews);
    });

    clapRef.on("value", snapshot => {
      currentGlobalClaps = snapshot.val() || 0;
      if (clapTotalEl) clapTotalEl.innerText = formatNum(currentGlobalClaps);
    });

    // PENTING: Menghubungkan triggerClap ke window agar onclick berjalan
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
