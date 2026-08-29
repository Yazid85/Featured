(function() {
  window.TikGram = window.TikGram || {};
  if (window.TikGram.tiktok !== 1) {
    return;
  }

  // Mengambil konfigurasi dari objek TikGram, fallback ke default jika tidak diset
  const config = window.TikGram;
  const webAppUrl = config.webAppUrl || 'https://script.google.com/macros/s/AKfycbxlDUABkRZYv2Fi2ugMBlxAnSIj9cBEl92lNsg1dpYnZNBTmlfXntcQCzwDLXIiRLbn/exec';

  const searchSvgIcon = config.searchSvgIcon || '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
  const pasteSvgIcon = config.pasteSvgIcon || '<svg viewBox="0 0 24 24"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/></svg>';
  const downloadSvgIcon = config.downloadSvgIcon || '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
  const buttonSpinnerHtml = config.buttonSpinnerHtml || '<div class="btn-spinner"></div>';

  const tiktokdw = `
  <style>
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .snap-container { max-width: 600px; margin: 20px auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
  .input-group { background: transparent; display: flex; gap: 10px; margin-top: 15px; }
  .input-group:focus-within { background-color: transparent !important; }
  .input-group input { -webkit-tap-highlight-color: transparent; flex: 1; padding: 14px; background-color: transparent !important; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; outline: none; }
  .input-group input:focus { border-color: #fe2c55; background-color: transparent !important; }
  .input-group input:-webkit-autofill,
  .input-group input:-webkit-autofill:hover, 
  .input-group input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 30px transparent inset !important; -webkit-text-fill-color: inherit !important; }
  .input-group button { -webkit-tap-highlight-color: transparent; padding: 14px; background: #fe2c55; color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; white-space: nowrap; width: 50px; height: 50px; box-sizing: border-box; }
  .input-group button:hover { background: #e0244b; }
  .input-group button svg { width: 20px; height: 20px; fill: currentColor; }
  .thumbnail-container { -webkit-tap-highlight-color: transparent; border-radius: 12px; width: 100%; text-align: center; margin-bottom: 15px; background: transparent; border: none; box-shadow: none; overflow: hidden; }
  .result-card img.video-thumb { -webkit-tap-highlight-color: transparent; width: 100%; max-height: 400px; object-fit: contain; display: block; border-radius: 12px; background: transparent; border: none; }
  .author-box { -webkit-tap-highlight-color: transparent; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .author-box img.avatar { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd; }
  .author-box .username { font-weight: bold; font-size: 16px; color: #222; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: center; border: 1px solid #eee; }
  .stat-item { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 13px; font-weight: bold; color: #111; }
  .stat-item svg { width: 16px; height: 16px; fill: #666; flex-shrink: 0; }
  .button-group { display: flex; flex-direction: column; gap: 10px; }
  .btn-download { -webkit-tap-highlight-color: transparent; position: relative; display: flex; align-items: center; justify-content: center; width: 100%; padding: 14px 16px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; border: none; transition: background 0.2s; box-sizing: border-box; }
  .btn-download:hover { background: #333; }
  .btn-download svg { position: absolute; left: 16px; width: 20px; height: 20px; fill: currentColor; }
  .btn-hd { background: #fe2c55; }
  .btn-hd:hover { background: #e0244b; }
  .hd-badge { -webkit-tap-highlight-color: transparent; position: absolute; right: 16px; background: #ffffff; color: #fe2c55; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }

  .btn-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; box-sizing: border-box; }

  .photo-grid { -webkit-tap-highlight-color: transparent; display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-bottom: 15px; text-align: left; padding: 4px; }
  .photo-item { -webkit-tap-highlight-color: transparent; position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #ddd; cursor: pointer; transition: all 0.2s; background: #f9f9f9; aspect-ratio: 1; }
  .photo-item.selected { border-color: #fe2c55; box-shadow: 0 0 8px rgba(254,44,85,0.3); }
  .photo-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; color: #666; font-weight: 500; }
  .photo-actions button { background: none; border: none; color: #fe2c55; font-weight: bold; cursor: pointer; padding: 0; font-size: 13px; }
  .photo-actions button:hover { text-decoration: underline; }
  .photo-item input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background-color: rgb(0 0 0 / .4); border: 2px solid #fff; border-radius: 50%; cursor: pointer; z-index: 2; outline: none; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
  .photo-item input[type="checkbox"]:checked { background-color: #fe2c55; border-color: #fe2c55; }
  .photo-item input[type="checkbox"]:checked::after { content: ""; width: 6px; height: 11px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px; }

  .reset-btn-action { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; margin-top: 20px; padding: 12px; background: transparent; border: none; cursor: pointer; color: #666; font-size: 14px; font-weight: 500; transition: color 0.2s; user-select: none; -webkit-tap-highlight-color: transparent; }
  .reset-btn-action:hover { color: #fe2c55; }
  .reset-btn-action svg { width: 18px; height: 18px; fill: currentColor; pointer-events: none; }
  .reset-btn-action span { pointer-events: none; }

  .box-mode {
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }
  .box-mode.from-left { transform: translateX(-80px); }
  .box-mode.from-right { transform: translateX(80px); }
  .box-mode.show { opacity: 1; transform: translateX(0); }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
  </style>

  <div class="snap-container">
    <div id="inputGroupContainer">
      <form id="tiktokForm" onclick="" onsubmit="handleDownload(event)">
        <div class="input-group">
          <input type="url" name="url" id="targetUrl" placeholder="Tempel link video/foto TikTok & Instagram di sini..." required />
          <button type="button" id="submitBtn" onclick="handleMainAction()" title="Tempel Link">
            ${pasteSvgIcon}
          </button>
        </div>
      </form>
    </div>

    <div id="loading" style="display:none;">
        <div class="header-spinner-text" id="loadingText">Sedang memproses konten...</div>
    </div>
    <div id="downloadResult"></div>

    <button type="button" class="reset-btn-action" id="realResetBtn" style="display: none;">
      <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
      <span>Unduh Konten Lainnya</span>
    </button>
  </div>
  `;

  function renderTikTokWidget() {
    const container = document.getElementById('tiktokdownloader');
    if (container && !container.innerHTML.trim()) {
      container.innerHTML = tiktokdw;
      initTikTokScript();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderTikTokWidget);
  } else {
    renderTikTokWidget();
  }
  window.addEventListener('load', renderTikTokWidget);

  function initFaqAnimations() {
    const faqBoxes = document.querySelectorAll('.box-mode');
    if (faqBoxes.length === 0) return;

    faqBoxes.forEach((box, index) => {
      if (!box.classList.contains('from-left') && !box.classList.contains('from-right')) {
        if (index % 2 === 0) {
          box.classList.add('from-left');
        } else {
          box.classList.add('from-right');
        }
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        } else {
          entry.target.classList.remove('show');
        }
      });
    }, {
      threshold: 0.15
    });

    faqBoxes.forEach(box => {
      observer.observe(box);
    });
  }

  function initTikTokScript() {
    let loadInterval = null;

    function getElements() {
      return {
        targetUrlInput: document.getElementById('targetUrl'),
        submitBtn: document.getElementById('submitBtn'),
        inputGroupContainer: document.getElementById('inputGroupContainer'),
        tiktokForm: document.getElementById('tiktokForm'),
        loadingDiv: document.getElementById('loading'),
        loadingText: document.getElementById('loadingText'),
        resultDiv: document.getElementById('downloadResult'),
        realResetBtn: document.getElementById('realResetBtn')
      };
    }

    document.addEventListener('input', function(e) {
      if (e.target && e.target.id === 'targetUrl') {
        const els = getElements();
        if (els.submitBtn && !els.submitBtn.disabled) {
          els.submitBtn.innerHTML = e.target.value.trim().length > 0 ? searchSvgIcon : pasteSvgIcon;
        }
      }
    });

    window.handleMainAction = async function() {
      const els = getElements();
      const inputVal = els.targetUrlInput ? els.targetUrlInput.value.trim() : '';
      if (inputVal.length === 0) {
        await window.handlePaste();
      } else if (els.tiktokForm) {
        els.tiktokForm.requestSubmit ? els.tiktokForm.requestSubmit() : els.tiktokForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    };

    window.handlePaste = async function() {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          const els = getElements();
          if (els.targetUrlInput) els.targetUrlInput.value = text;
          if (els.submitBtn) els.submitBtn.innerHTML = searchSvgIcon;
        }
      } catch (err) {
        alert('Silakan izinkan akses clipboard atau tempel secara manual.');
      }
    };

    window.handleDownload = function(e) {
      if (e) e.preventDefault();
      const els = getElements();
      const urlInput = els.targetUrlInput ? els.targetUrlInput.value.trim() : '';
      if (!urlInput) return;

      if (els.loadingDiv) {
        els.loadingDiv.style.display = 'block';
        let dotCount = 0;
        if (loadInterval) clearInterval(loadInterval);
        loadInterval = setInterval(() => {
          dotCount = (dotCount % 3) + 1;
          if (els.loadingText) {
            els.loadingText.textContent = 'Sedang memproses konten' + '.'.repeat(dotCount);
          }
        }, 400);
      }
      if (els.resultDiv) els.resultDiv.innerHTML = '';
      if (els.realResetBtn) els.realResetBtn.style.display = 'none';
      if (els.submitBtn) {
        els.submitBtn.disabled = true;
        els.submitBtn.innerHTML = buttonSpinnerHtml;
      }

      const oldScript = document.getElementById('jsonpScript');
      if (oldScript) oldScript.remove();

      const script = document.createElement('script');
      script.id = 'jsonpScript';
      script.src = `${webAppUrl}?url=${encodeURIComponent(urlInput)}&callback=displayResult`;
      
      script.onerror = function() {
        if (loadInterval) { clearInterval(loadInterval); loadInterval = null; }
        if (els.loadingDiv) els.loadingDiv.style.display = 'none';
        if (els.resultDiv) els.resultDiv.innerHTML = '<p style="color:red; text-align:center; margin-top:15px;">Terjadi kesalahan koneksi server.</p>';
        if (els.submitBtn) {
          els.submitBtn.disabled = false;
          els.submitBtn.innerHTML = searchSvgIcon;
        }
      };

      document.body.appendChild(script);
    };

    function generateRandomString(length = 6) {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    window.displayResult = function(data) {
      if (loadInterval) { clearInterval(loadInterval); loadInterval = null; }
      const els = getElements();
      if (els.loadingDiv) els.loadingDiv.style.display = 'none';
      if (els.submitBtn) {
        els.submitBtn.disabled = false;
        els.submitBtn.innerHTML = searchSvgIcon;
      }

      if (data && data.success) {
        if (els.inputGroupContainer) els.inputGroupContainer.style.display = 'none';

        const randomCode = generateRandomString(6);
        const normalFilename = `aDv_${randomCode}.mp4`;
        const hdFilename = `aDv_${randomCode}_HD.mp4`;

        if (els.resultDiv) {
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            let photosHtml = `
              <div class="result-card">
                <div class="author-box">
                  <img src="${data.avatar}" class="avatar" alt="Avatar" onerror="this.src='https://via.placeholder.com/45'" />
                  <span class="username">@${data.author}</span>
                </div>
                <div class="photo-actions">
                  <span>Pilih foto untuk diunduh (${data.images.length} foto)</span>
                  <div>
                    <button type="button" onclick="toggleAllPhotos(true)">Pilih Semua</button> | 
                    <button type="button" onclick="toggleAllPhotos(false)">Batal Pilih</button>
                  </div>
                </div>
                <div class="photo-grid" id="photoGridContainer">
            `;

            data.images.forEach((imgUrl, idx) => {
              photosHtml += `
                <div class="photo-item selected" onclick="togglePhotoItem(this, event)">
                  <input type="checkbox" class="photo-checkbox" value="${imgUrl}" checked data-index="${idx + 1}" />
                  <img src="${imgUrl}" alt="Photo ${idx + 1}" crossorigin="anonymous" />
                </div>
              `;
            });

            photosHtml += `
                </div>
                <div class="button-group" style="margin-top: 15px;">
                  <button type="button" class="btn-download btn-hd" onclick="downloadSelectedPhotos('${randomCode}')">
                    ${downloadSvgIcon}
                    <span>Download Foto (HD)</span>
                    <span class="hd-badge">HD</span>
                  </button>
                </div>
              </div>
            `;
            els.resultDiv.innerHTML = photosHtml;
          } else {
            els.resultDiv.innerHTML = `
              <div class="result-card">
                <div class="thumbnail-container">
                  ${data.thumbnail ? `<img src="${data.thumbnail}" class="video-thumb" alt="Thumbnail Video" />` : ''}
                </div>

                <div class="author-box">
                  <img src="${data.avatar}" class="avatar" alt="Avatar" onerror="this.src='https://via.placeholder.com/45'" />
                  <span class="username">@${data.author}</span>
                </div>

                <div class="stats-grid">
                  <div class="stat-item">
                    <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    <span>${numberFormat(data.play_count)}</span>
                  </div>
                  <div class="stat-item">
                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span>${numberFormat(data.digg_count)}</span>
                  </div>
                  <div class="stat-item">
                    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                    <span>${numberFormat(data.comment_count)}</span>
                  </div>
                  <div class="stat-item">
                    <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
                    <span>${numberFormat(data.share_count)}</span>
                  </div>
                </div>

                <div class="button-group">
                  <button type="button" class="btn-download" onclick="downloadVideoFile('${data.normalUrl}', '${normalFilename}', this)">
                    ${downloadSvgIcon}
                    <span>Download (No Watermark)</span>
                  </button>
                  <button type="button" class="btn-download btn-hd" onclick="downloadVideoFile('${data.hdUrl}', '${hdFilename}', this)">
                    ${downloadSvgIcon}
                    <span>Download (No Watermark)</span>
                    <span class="hd-badge">HD</span>
                  </button>
                </div>
              </div>
            `;
          }
        }
        if (els.realResetBtn) els.realResetBtn.style.display = 'flex';
      } else {
        if (els.resultDiv) els.resultDiv.innerHTML = `<p style="color:red; text-align:center; margin-top:15px;">${data.message || 'Gagal memproses konten.'}</p>`;
      }
      setTimeout(initFaqAnimations, 50);
    };

    window.togglePhotoItem = function(itemElement, event) {
      if (event.target.tagName === 'INPUT') return;
      const checkbox = itemElement.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        if (checkbox.checked) {
          itemElement.classList.add('selected');
        } else {
          itemElement.classList.remove('selected');
        }
      }
    };

    document.addEventListener('change', function(e) {
      if (e.target && e.target.classList.contains('photo-checkbox')) {
        const parentItem = e.target.closest('.photo-item');
        if (parentItem) {
          if (e.target.checked) {
            parentItem.classList.add('selected');
          } else {
            parentItem.classList.remove('selected');
          }
        }
      }
    });

    window.toggleAllPhotos = function(select) {
      const checkboxes = document.querySelectorAll('.photo-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = select;
        const parentItem = cb.closest('.photo-item');
        if (parentItem) {
          if (select) {
            parentItem.classList.add('selected');
          } else {
            parentItem.classList.remove('selected');
          }
        }
      });
    };

    window.downloadSelectedPhotos = async function(randomCode) {
      const checkboxes = document.querySelectorAll('.photo-checkbox:checked');
      if (checkboxes.length === 0) {
        alert('Silakan pilih minimal satu foto untuk diunduh.');
        return;
      }

      const btn = document.querySelector('.btn-hd');
      const originalContent = btn ? btn.innerHTML : '';
      let dotCount = 0;
      let animInterval = null;

      if (btn) {
        btn.disabled = true;
        animInterval = setInterval(() => {
          dotCount = (dotCount % 3) + 1;
          const dots = '.'.repeat(dotCount);
          btn.innerHTML = `${downloadSvgIcon}<span>Mengunduh${dots}</span><span class="hd-badge">HD</span>`;
        }, 400);
      }

      try {
        for (let i = 0; i < checkboxes.length; i++) {
          const imgUrl = checkboxes[i].value;
          const indexNum = checkboxes[i].getAttribute('data-index');
          const filename = `aDv_${randomCode}_foto_${indexNum}.jpg`;

          try {
            const response = await fetch(imgUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
              window.URL.revokeObjectURL(blobUrl);
              document.body.removeChild(a);
            }, 1000);
          } catch (err) {
            const a = document.createElement('a');
            a.href = imgUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      } finally {
        if (animInterval) clearInterval(animInterval);
        if (btn) {
          btn.innerHTML = originalContent;
          btn.disabled = false;
        }
      }
    };

    function executeReset() {
      if (loadInterval) { clearInterval(loadInterval); loadInterval = null; }
      const els = getElements();
      if (els.targetUrlInput) els.targetUrlInput.value = '';
      if (els.inputGroupContainer) els.inputGroupContainer.style.display = 'block';
      if (els.realResetBtn) els.realResetBtn.style.display = 'none';
      if (els.submitBtn) {
        els.submitBtn.innerHTML = pasteSvgIcon;
        els.submitBtn.disabled = false;
      }
      if (els.resultDiv) els.resultDiv.innerHTML = '';
      setTimeout(initFaqAnimations, 50);
    }

    const resetBtn = document.getElementById('realResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', executeReset);
      resetBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        executeReset();
      });
    }

    window.downloadVideoFile = async function(videoUrl, filename, btn) {
      const originalContent = btn.innerHTML;
      let dotCount = 0;
      let animInterval = null;

      btn.disabled = true;
      animInterval = setInterval(() => {
        dotCount = (dotCount % 3) + 1;
        const dots = '.'.repeat(dotCount);
        const isHd = btn.classList.contains('btn-hd');
        if (isHd) {
          btn.innerHTML = `${downloadSvgIcon}<span>Mengunduh${dots}</span><span class="hd-badge">HD</span>`;
        } else {
          btn.innerHTML = `${downloadSvgIcon}<span>Mengunduh${dots}</span>`;
        }
      }, 400);

      try {
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        }, 1000);

      } catch (err) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        if (animInterval) clearInterval(animInterval);
        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.disabled = false;
        }, 1500);
      }
    };

    function numberFormat(num) {
      if (!num || num === 0) return '0';
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num;
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('advtik.html')) {
      const boxes = document.querySelectorAll('.box-mode');
      if (boxes.length >= 3) {
        boxes[0].querySelector('h4').textContent = 'Cara Mengunduh Konten TikTok';
        boxes[0].querySelector('p').textContent = 'Tempel tautan video atau foto dari TikTok/Instagram pada kolom di atas, lalu sistem akan memproses file bersih tanpa tanda air secara otomatis.';

        boxes[1].querySelector('h4').textContent = 'Tentang TikTok';
        boxes[1].querySelector('p').textContent = 'Gunakan tool ini untuk menyimpan video atau galeri foto dalam kualitas HD langsung ke perangkat Anda dengan mudah dan cepat tanpa aplikasi tambahan.';

        boxes[2].querySelector('h4').textContent = 'Suka dengan Tool Ini?';
        boxes[2].querySelector('p').innerHTML = 'Ingin membuat halaman downloader sendiri di blog Anda? Pelajari cara mengintegrasikannya dengan mudah di <a href="https://advsl.blogspot.com/">situs utama</a>.';
      }
    }

    initFaqAnimations();
  });
})();
