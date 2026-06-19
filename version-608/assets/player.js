import { H as Hls } from "./vendor/hls.js";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(function (wrapper) {
    var video = wrapper.querySelector("video[data-src]");
    var button = wrapper.querySelector("[data-player-start]");
    var status = wrapper.querySelector("[data-player-status]");
    var hlsInstance = null;
    var hasLoaded = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function loadSource() {
      if (!video || hasLoaded) {
        return;
      }

      var source = video.dataset.src;
      if (!source) {
        setStatus("未找到播放源");
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("正在加载播放源");
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪");
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放加载失败，请刷新后重试");
          }
        });
      } else {
        video.src = source;
        setStatus("当前浏览器可能不支持 HLS 播放");
      }

      hasLoaded = true;
    }

    function startPlayback() {
      loadSource();
      wrapper.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("请再次点击播放器开始播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("play", function () {
        wrapper.classList.add("is-playing");
        setStatus("");
      });
      video.addEventListener("pause", function () {
        setStatus("已暂停");
      });
      video.addEventListener("waiting", function () {
        setStatus("缓冲中");
      });
      video.addEventListener("error", function () {
        setStatus("播放遇到错误");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
