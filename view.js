(function () {
  const config = window.wcViewCountFbase || {};
  
  if (!config.firebaseUrl) {
    console.warn("ViewCounter: firebaseUrl belum diatur.");
    return;
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  async function processViewCounter() {
    const el = document.getElementById("post-view-count");
    if (!el) return;

    const postId = el.getAttribute("data-id");
    if (!postId) return;

    const baseUrl = config.firebaseUrl.endsWith("/")
      ? config.firebaseUrl
      : config.firebaseUrl + "/";
    const endpoint = `${baseUrl}views/${postId}.json`;

    // Cek sessionStorage agar tidak bertambah saat refresh
    const storageKey = `visited_post_${postId}`;
    const isAlreadyVisited = sessionStorage.getItem(storageKey);

    try {
      let updatedCount = 0;

      if (config.type === "1" && !isAlreadyVisited) {
        const response = await fetch(endpoint);
        const count = await response.json();
        updatedCount = (count || 0) + 1;

        await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCount)
        });

        sessionStorage.setItem(storageKey, "true");
      } else {
        const response = await fetch(endpoint);
        updatedCount = (await response.json()) || 0;
      }

      const displayCount = (config.abbreviation === "1")
        ? formatNumber(updatedCount)
        : updatedCount.toLocaleString();

      el.textContent = `${displayCount} views`;
    } catch (error) {
      console.error("ViewCounter Error:", error);
      el.textContent = "0 views";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processViewCounter);
  } else {
    processViewCounter();
  }
})();
