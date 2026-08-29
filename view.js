(function () {
  // Paksa membaca objek global var wcViewCountFbase dari HTML
  const conf = window.wcViewCountFbase || {};
  const fbase = conf.firebaseUrl || 'https://like-viewcnt-default-rtdb.asia-southeast1.firebasedatabase.app/';
  
  // Format singkatan
  const useAbbr = Number(conf.abbreviation || 0);

  const svgClap = '<svg viewBox="0 0 24 24"><path d="M20.9 9.5c-.3-.4-.8-.6-1.3-.6h-4.3l.7-3.4c.1-.4 0-.8-.3-1.1-.3-.3-.8-.5-1.3-.5-.3 0-.6.1-.9.3L8 9H3v10h12.5c1 0 1.9-.6 2.3-1.5l3.2-6.5c.2-.5.2-1-.1-1.5zM5 17v-6h2v6H5zm14-6.8L15.8 17H9V9.5l3.5-3.5.7 3.6h5.7c.1 0 .2.1.2.2 0 0 0 .1-.1.2z"/></svg>';

  // Logika Format Angka K/M yang benar
  function formatNum(num) {
    num = Number(num) || 0;
    
    // Default Penuh
    if (useAbbr === 0) return num.toLocaleString();
    
    // Huruf Kecil
    if (useAbbr === 1) {
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.', ',') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1).replace('.', ',') + 'K';
      return num.toString();
    }
    
    return num.toLocaleString();
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

    const vEl = document.getElementById("viewTotalCount");
    const cEl = document.getElementById("clapTotalCount");
    const btn = document.getElementById("apmodyClapBtn");
    const toastEl = document.getElementById("apmodyToast");
    const tContent = document.getElementById("toastTextContent");

    let vKey = "viewed_" + id;
    if (!sessionStorage.getItem(vKey)) {
      sessionStorage.setItem(vKey, "true");
      viewRef.transaction(v => (v || 0) + 1);
    }
    
    // Menjalankan formatNum() saat view didapatkan dari database
    viewRef.on("value", snap => { if(vEl) vEl.innerText = formatNum(snap.val() || 0); });

    let cKey = "claps_" + id;
    let given = parseInt(localStorage.getItem(cKey)) || 0;
    let globalC = 0;

    // Menjalankan formatNum() pada Total Claps
    clapRef.on("value", snap => {
      globalC = snap.val() || 0;
      if(cEl) cEl.innerText = formatNum(globalC);
    });

    window.triggerClap = function() {
      const maxLimit = 50;
      
      // Mengambil ulang objek global ketika tombol diklik
      const confNow = window.wcViewCountFbase || {};
      
      let tplClap = confNow.toastClapText || 'Clap <span>+{count}</span>';
      let tplMax = confNow.toastMaxText || 'Max limit: <span>{max}</span>';

      if (given < maxLimit) {
        given++;
        localStorage.setItem(cKey, given);
        clapRef.transaction(c => (c || 0) + 1);
        
        if(toastEl && tContent) {
          tContent.innerHTML = tplClap.replace(/\{count\}/g, given).replace(/\{max\}/g, maxLimit);
          toastEl.classList.add("show");
          setTimeout(() => toastEl.classList.remove("show"), 1500);
        }
      } else {
        if(toastEl && tContent) {
          tContent.innerHTML = tplMax.replace(/\{count\}/g, given).replace(/\{max\}/g, maxLimit);
          toastEl.classList.add("show");
          setTimeout(() => toastEl.classList.remove("show"), 2000);
        }
      }
    };

    window.addEventListener("scroll", () => {
      if(window.scrollY > 30) {
        if(btn) btn.classList.add("visible");
      } else {
        if(btn) btn.classList.remove("visible");
      }
    });
  });
})();
