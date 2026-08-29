(function () {
  const conf = window.wcViewCountFbase || {};
  const fbase = conf.firebaseUrl || 'https://like-viewcnt-default-rtdb.asia-southeast1.firebasedatabase.app/';
  const useAbbr = conf.abbreviation || '0';
  const typeWidget = conf.type || '1';

  // Opsi Teks Notifikasi dari Config (dengan fallback default)
  const tplClap = conf.toastClapText || 'Clap <span>+{count}</span>';
  const tplMax = conf.toastMaxText || 'Max limit reached: <span>{max} claps</span>';

  function formatNum(num) {
    num = Number(num) || 0;
    if (useAbbr === '0') return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  }

  function loadFB(cb) {
    if (window.firebase && window.firebase.database) { cb(); return; }
    let s1 = document.createElement('script');
    s1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
    s1.onload = function() {
      let s2 = document.createElement('script');
      s2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
      s2.onload = cb;
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  }

  loadFB(function() {
    if (!firebase.apps.length) {
      firebase.initializeApp({ databaseURL: fbase });
    }
    const db = firebase.database();
    let path = window.location.pathname.replace(/^\/|\/$/g, '');
    let id = path ? path.replace(/[^a-zA-Z0-9]/g, '_') : 'homepage';

    const viewRef = db.ref("posts/" + id + "/views");
    const clapRef = db.ref("posts/" + id + "/claps");

    const vEl = document.getElementById("viewTotalCount") || document.getElementById("aDvTotal");
    const cEl = document.getElementById("clapTotalCount") || document.getElementById("aDcTotal");
    const btn = document.getElementById("apmodyClapBtn") || document.getElementById("aDcBtn");
    const toastEl = document.getElementById("apmodyToast") || document.getElementById("aDt");

    // Hitung View
    let vKey = "viewed_" + id;
    if (!sessionStorage.getItem(vKey)) {
      sessionStorage.setItem(vKey, "true");
      viewRef.transaction(v => (v || 0) + 1);
    }
    viewRef.on("value", snap => { if(vEl) vEl.innerText = formatNum(snap.val() || 0); });

    // Hitung Clap
    let cKey = "claps_" + id;
    let given = parseInt(localStorage.getItem(cKey)) || 0;
    let globalC = 0;

    clapRef.on("value", snap => {
      globalC = snap.val() || 0;
      if(cEl) cEl.innerText = formatNum(globalC);
    });

    // Fungsi Global Tombol Clap
    window.triggerClap = function() {
      const maxLimit = 50;
      if (given < maxLimit) {
        given++;
        localStorage.setItem(cKey, given);
        clapRef.transaction(c => (c || 0) + 1);
        
        if(toastEl) {
          toastEl.innerHTML = tplClap.replace('{count}', given).replace('{max}', maxLimit);
          toastEl.classList.add("show");
          setTimeout(() => toastEl.classList.remove("show"), 1500);
        }
      } else {
        if(toastEl) {
          toastEl.innerHTML = tplMax.replace('{count}', given).replace('{max}', maxLimit);
          toastEl.classList.add("show");
          setTimeout(() => toastEl.classList.remove("show"), 2000);
        }
      }
    };

    // Scroll effect tombol
    window.addEventListener("scroll", () => {
      if(window.scrollY > 30) {
        if(btn) btn.classList.add("visible");
      } else {
        if(btn) btn.classList.remove("visible");
      }
    });
  });
})();
