(function () {
  const conf = window.wcViewCountFbase || {};
  const fbase = conf.firebaseUrl || 'https://like-viewcnt-default-rtdb.asia-southeast1.firebasedatabase.app/';
  const useAbbr = Number(conf.abbreviation || 0);
  const viewType = conf.type !== undefined ? conf.type : 1;

  function formatNum(num) {
    num = Number(num) || 0;
    if (useAbbr === 0) return num.toLocaleString();
    if (useAbbr === 1) {
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.', ',') + 'm';
      if (num >= 1000) return (num / 1000).toFixed(1).replace('.', ',') + 'k';
      return num.toString();
    }
    if (useAbbr === 2) {
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
    try {
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

      if (viewType == "0" || viewType === 0) {
        let vKey = "viewed_perm_" + id;
        if (!localStorage.getItem(vKey)) {
          localStorage.setItem(vKey, "true");
          viewRef.transaction(v => (v || 0) + 1);
        }
      } else {
        let vKey = "viewed_" + id;
        if (!sessionStorage.getItem(vKey)) {
          sessionStorage.setItem(vKey, "true");
          viewRef.transaction(v => (v || 0) + 1);
        }
      }
      
      viewRef.on("value", snap => { 
        if(vEl) {
          vEl.innerText = formatNum(snap.val() || 0); 
        }
      });

      let cKey = "claps_" + id;
      let given = parseInt(localStorage.getItem(cKey)) || 0;

      clapRef.on("value", snap => {
        let globalC = snap.val() || 0;
        if(cEl) {
          cEl.innerText = formatNum(globalC); 
        }
      });

      window.triggerClap = function() {
        const liveConf = window.wcViewCountFbase || {};
        // Membaca langsung maxLimit dari objek Blogger, jika tidak ada fallback ke 100
        const maxLimit = Number(liveConf.maxLimit) || 100;
        
        let tplClap = liveConf.toastClapText || 'Terima kasih! Clap <span>+{count}</span>';
        let tplMax = liveConf.toastMaxText || 'Maksimal batas clap adalah <span>{max}</span> kali!';

        if (given >= maxLimit) {
          localStorage.setItem(cKey, maxLimit);
          given = maxLimit;
        }

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

      if(btn) btn.classList.add("visible");
    } catch(e) {
      console.error("Firebase Initialization Error:", e);
    }
  });
})();
