var serverResponse = JSON.parse(sessionStorage.getItem('serverResponse'));
console.log(serverResponse)
var thumbnailsWrapper = document.getElementById('thumbnailsWrapper');
var editPanel = document.getElementById('editPanel');
var decodedPath
var json_data = sessionStorage.getItem('data')
var data = JSON.parse(json_data);
var file_name, parts_2_name, judgments_name, judgments_flags = 0;
console.log(data)
//发送请求
function Send_Post(formData, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                }
                else {
                    reject('Error: ' + xhr.statusText);
                }
            }
        };
        xhr.send(formData);
    });
}
//视频框展示的页面
function Show_data(serverResponse) {
    thumbnailsWrapper.innerHTML = "";
    if (serverResponse && serverResponse.file_names && serverResponse.types && serverResponse.file_names.length === serverResponse.types.length && serverResponse.file_names.length != 0) {
        // 创建大框容器
        var wrapperDiv = document.createElement('div');
        wrapperDiv.id = 'thumbnailsWrapper2';

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

                // 创建 Canvas 元素
                var canvas = document.createElement('canvas');
                canvas.width = thumbnailDiv.clientWidth; // 设置 Canvas 宽度为缩略图容器宽度
                canvas.height = thumbnailDiv.clientWidth * (9 / 16); // 设置 Canvas 高度为宽度的 16:9 比例
                var context = canvas.getContext('2d');

                // 视频加载元数据后执行
                videoElement.addEventListener('loadedmetadata', function () {
                    // 设置视频当前时间为第一帧
                    videoElement.currentTime = 0;

                    // 当视频可以播放时执行
                    videoElement.addEventListener('canplay', function () {
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
                thumbnailDiv.addEventListener('click', function (event) {
                    event.stopPropagation(); // 阻止事件继续传播到文档级别
                    editPanel.style.display = 'block';
                    let videoSrc_1 = this.querySelector('video').src;
                    console.log(videoSrc_1)
                    decodedPath = decodeURIComponent(decodeURIComponent(videoSrc_1));
                    document.getElementById('thumbnailsWrapper').style.width = '70%';
                    console.log(decodedPath)
                    console.log(data.file_name)
                    var foundData = data.find(function (item) {
                        return item.file_name === decodedPath;
                    });
                    console.log(foundData)
                    if (foundData) {
                        editTextarea.value = foundData.description;
                    }
                    else {
                        editTextarea.value = '';
                    }
                });


                // 双击视频缩略图时将视频路径传递给下一个页面
                thumbnailDiv.addEventListener('dblclick', function () {
                    var videoSrc = this.querySelector('video').src;
                    sessionStorage.setItem('videoSrc', videoSrc);
                    window.location.href = 'play.html';
                });
                // 添加视频元素到缩略图容器
                thumbnailDiv.appendChild(videoElement);
                var p = document.createElement('p');
                p.style.fontSize = 15;
                p.style.marginTop = "2%";
                p.style.textAlign = "center";
                let parts = serverResponse['file_names'][i].split("\\")
                console.log(parts)
                file_name = parts[parts.length - 1].split('.')[0]
                p.innerHTML = file_name
                thumbnailDiv.appendChild(p)
                if (serverResponse['file_names'][i] != null && data[judgments_flags] != null) {
                    parts_2_name = data[judgments_flags]["file_name"].split('/')
                    judgments_name = parts_2_name[parts_2_name.length - 1].split('.')[0]
                }
                if (data.length != 0 && judgments_name == file_name) {
                    var p2 = document.createElement("p");
                    p2.style.fontSize = 13;
                    p2.style.color = "#808080";
                    p2.style.marginTop = "2%";
                    p2.style.textAlign = "center";
                    let parts_2 = data[judgments_flags]['description']
                    p2.innerHTML = parts_2
                    console.log(data[judgments_flags]['file_name'])
                    thumbnailDiv.appendChild(p2)
                    judgments_flags = judgments_flags + 1
                }

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
}
Show_data(serverResponse)
judgments_flags = 0
document.addEventListener("DOMContentLoaded", function () {
    var saveButton = document.getElementById("saveButton");
    var editTextarea = document.getElementById("editTextarea");
    saveButton.addEventListener("click", function () {
        var textValue = editTextarea.value;
        var formData = {
            data: {
                user_id: [sessionStorage.getItem('username')], // 将输入的值放入"path"字段中
                file_name: [decodedPath],
                description: [textValue],
                file_path: [sessionStorage.getItem('file_path')]
            },
            "table": "files_data"
        };

        var jsonData = JSON.stringify(formData); // 将表单数据转换为 JSON 格式
        console.log(jsonData)
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:8000/update_data", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (response['status'] == "success") {
                        console.log("success")
                        var formData2 = {
                            user_id: sessionStorage.getItem('username'), // 将输入的值放入"path"字段中
                            table: "files_data"
                        };

                        var jsonData2 = JSON.stringify(formData2); // 将表单数据转换为 JSON 格式
                        var xhr2 = new XMLHttpRequest();
                        xhr2.open("POST", "http://127.0.0.1:8000/get_data", true);
                        xhr2.setRequestHeader("Content-Type", "application/json");

                        xhr2.onreadystatechange = function () {
                            if (xhr2.readyState === XMLHttpRequest.DONE) {
                                if (xhr2.status === 200) {
                                    var response = JSON.parse(xhr2.responseText);
                                    data = response
                                    console.log(data)
                                    Show_data()
                                } else {
                                    console.error('Error:', xhr2.statusText);
                                }
                            }
                        };

                        xhr2.send(jsonData2);
                    }
                } else {
                    console.error('Error:', xhr.statusText);
                }
            }
        };

        xhr.send(jsonData);
    });

    var formData_history = {
        user_id: sessionStorage.getItem('username'),
        table: "history"
    };
    var jsonData_history = JSON.stringify(formData_history); // 将表单数据转换为 JSON 格式
    var xhr_history = new XMLHttpRequest();
    xhr_history.open("POST", "http://127.0.0.1:8000/get_data", true);
    xhr_history.setRequestHeader("Content-Type", "application/json");

    xhr_history.onreadystatechange = function () {
        if (xhr_history.readyState === XMLHttpRequest.DONE) {
            if (xhr_history.status === 200) {
                var response = JSON.parse(xhr_history.responseText);

                var ul = document.getElementById("left_ul");

                response.forEach(function (item) {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(item['history_data']));
                    ul.appendChild(li);
                });
                var li_click = document.getElementById("left_ul").querySelectorAll("li")
                console.log(li_click)

                li_click.forEach(function (item) {
                    console.log(item)
                    item.addEventListener("click", function () {
                        console.log(item.innerText)
                        var formData_path = {
                            path: item.innerText // 将输入的值放入"path"字段中
                        };
                        var jsonData = JSON.stringify(formData_path);
                        console.log(jsonData)
                        Send_Post(jsonData, "http://127.0.0.1:8000/get_path").then(function (result) {
                            console.log(result)
                            serverResponse = result
                            Show_data(serverResponse)
                        }).catch(function (error) {
                            console.log(error)
                        });
                    })
                });

            } else {
                console.error('Error:', xhr_history.statusText);
            }
        }
    };

    xhr_history.send(jsonData_history);
    console.log(data)
});
document.addEventListener('click', function (event) {
    // 检查点击的目标是否是编辑栏以外的区域
    // console.log('test')
    if (!editPanel.contains(event.target)) {
        // console.log("test")
        // 隐藏编辑栏
        editPanel.style.display = 'none';
        // 将缩略图容器的宽度恢复到原始状态
        thumbnailsWrapper.style.width = '100%';
        editTextarea.value = '';
    }
});

document.getElementById("a_history").addEventListener("click", function () {
    var x = document.getElementById("left_ul").querySelectorAll("li")
    console.log(x)
    for (var i = 0; i < x.length; i++) {
        if (x[i].style.display === "none") {
            x[i].style.display = "block";
        } else {
            x[i].style.display = "none";
        }
    }
});

