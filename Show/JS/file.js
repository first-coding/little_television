// 从本地存储中获取服务器响应的内容
var serverResponse = JSON.parse(sessionStorage.getItem('serverResponse'));
var thumbnailsWrapper = document.getElementById('thumbnailsWrapper');
var editPanel = document.getElementById('editPanel');
var username = sessionStorage.getItem('username');
console.log(username)
if (serverResponse && serverResponse.file_names && serverResponse.types && serverResponse.file_names.length === serverResponse.types.length) {
    // 创建大框容器
    var wrapperDiv = document.createElement('div');
    wrapperDiv.id = 'thumbnailsWrapper';

    // 遍历服务器响应中的文件
    for (var i = 0; i < serverResponse.file_names.length; i++) {
        var fileName = serverResponse.file_names[i];
        var fileType = serverResponse.types[i];
        if (fileType === 'mp4') {
            // 创建缩略图容器
            var thumbnailDiv = document.createElement('div');
            thumbnailDiv.classList.add('thumbnail');

            // 创建视频元素
            var videoElement = document.createElement('video');
            videoElement.src = fileName;
            videoElement.controls = false; // 移除播放控件
            videoElement.setAttribute('autoplay', true);

            // 创建 Canvas 元素
            var canvas = document.createElement('canvas');
            canvas.width = thumbnailDiv.clientWidth; // 设置 Canvas 宽度为缩略图容器宽度
            canvas.height = thumbnailDiv.clientWidth * (9/16); // 设置 Canvas 高度为宽度的 16:9 比例
            var context = canvas.getContext('2d');

            // 视频加载元数据后执行
            videoElement.addEventListener('loadedmetadata', function() {
                // 设置视频当前时间为第一帧
                videoElement.currentTime = 0;

                // 当视频可以播放时执行
                videoElement.addEventListener('canplay', function() {
                    // 在 Canvas 上绘制当前视频帧
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                    // // 创建图像对象，获取绘制在 Canvas 上的图像数据
                    // var thumbnailImage = new Image();
                    // thumbnailImage.src = canvas.toDataURL('image/jpeg');

                    // // 将图像对象添加到缩略图容器中
                    // thumbnailDiv.appendChild(thumbnailImage);
                }, false);
            }, false);

            // 单击视频缩略图时显示编辑栏
            thumbnailDiv.addEventListener('click', function() {
                editPanel.style.display = 'block';
            });

            // 双击视频缩略图时将视频路径传递给下一个页面
            thumbnailDiv.addEventListener('dblclick', function() {
                var videoSrc = this.querySelector('video').src;
                sessionStorage.setItem('videoSrc', videoSrc);
                window.location.href = 'play.html';
            });

            // 添加视频元素到缩略图容器
            thumbnailDiv.appendChild(videoElement);

            // 添加缩略图容器到大框容器
            wrapperDiv.appendChild(thumbnailDiv);
        }
    }

    // 将大框容器添加到页面中
    thumbnailsWrapper.appendChild(wrapperDiv);
} else {
    // 如果没有服务器响应的内容，或者文件名和文件类型数量不匹配，显示相应的消息
    var messageElement = document.createElement('p');
    messageElement.textContent = "No mp4 files found.";
    document.body.appendChild(messageElement);
}