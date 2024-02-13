// 从sessionStorage中获取视频路径
var videoSrc = sessionStorage.getItem('videoSrc');

// 如果视频路径存在，则设置视频源
if (videoSrc) {
    var videoElement = document.querySelector('video');
    videoElement.src = videoSrc;
} else {
    // 如果视频路径不存在，则显示错误信息
    console.error('Video source not found.');
}