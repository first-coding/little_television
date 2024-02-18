var thumbnailsWrapper = document.getElementById('thumbnailsWrapper');
var editPanel = document.getElementById('editPanel');
var saveButton = document.getElementById("saveButton");
var editTextarea = document.getElementById("editTextarea");
var topnav_search = document.getElementById("topnav_search")
var myDropdown = document.getElementsByClassName("myDropdown");


var serverResponse = JSON.parse(sessionStorage.getItem('serverResponse'));
console.log(serverResponse)
var decodedPath
var json_data = sessionStorage.getItem('data')
var data = JSON.parse(json_data);
console.log(data)
var file_name, parts_2_name, judgments_name, judgments_flags = 0;
//发送请求
function Send_Post(formData, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    let response = JSON.parse(xhr.responseText);
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
function Show_data(serverResponse, data = data) {

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
    judgments_flags = 0
}
Show_data(serverResponse, data)
function search_Show_data(searchs_data) {
    thumbnailsWrapper.innerHTML = "";
    if (searchs_data) {
        // 创建大框容器
        let wrapperDiv = document.createElement('div');
        wrapperDiv.id = 'thumbnailsWrapper2';
        searchs_data.forEach(function (item) {

            let div = document.createElement("div");
            div.className = "search_show"
            let video = document.createElement("video");
            video.src = item["file_name"]
            video.controls = false;
            div.appendChild(video);

            let pDiv = document.createElement("div");
            pDiv.className = "pdiv_show"
            let p1 = document.createElement("p");
            let p1_file_name = item["file_name"].split("/")
            p1.textContent = p1_file_name[p1_file_name.length - 1].split(".")[0]
            pDiv.append(p1);
            let p2 = document.createElement("p")
            p2.textContent = item["description"]
            pDiv.appendChild(p2)

            div.appendChild(pDiv);
            wrapperDiv.appendChild(div)
            thumbnailsWrapper.append(wrapperDiv)
        })
    }
}
function get_html_data() {
    // 获取id为thumbnailsWrapper2的div
    let div = document.getElementById('thumbnailsWrapper2');

    // 获取该div内的所有子div
    let childDivs = div.getElementsByTagName('div');

    // 创建一个空数组来保存所有的数据
    let html_data = [];

    // 遍历每一个子div
    Array.from(childDivs).forEach((childDiv) => {
        // 获取video标签的src
        let videoSrc = childDiv.querySelector('video').src;

        // 获取所有p标签
        let pTags = childDiv.querySelectorAll('p');

        // 创建一个新的对象
        let obj = {
            file_path: decodeURIComponent(videoSrc),
            file_name: pTags[0] ? pTags[0].innerText : '',
            description: pTags[1] ? pTags[1].innerText : ''
        };

        // 将这个对象添加到数据数组中
        html_data.push(obj);
    });
    // console.log(html_data)
    sessionStorage.setItem('html_data', JSON.stringify(html_data));
}

//获取数据
document.addEventListener("DOMContentLoaded", function () {
    saveButton.addEventListener("click", function () {
        let textValue = editTextarea.value;
        let edit_data = {
            data: {
                user_id: [sessionStorage.getItem('username')], // 将输入的值放入"path"字段中
                file_name: [decodedPath],
                description: [textValue],
                file_path: [sessionStorage.getItem("file_path").replace(/"/g, '')]
            },
            "table": "files_data"
        };
        let edit_json_data = JSON.stringify(edit_data);
        // console.log(edit_json_data)
        Send_Post(edit_json_data, "http://127.0.0.1:8000/update_data").then(function (edit_data_response) {
            if (edit_data_response["status"] == "success") {
                let get_data = {
                    user_id: sessionStorage.getItem('username'), // 将输入的值放入"path"字段中
                    table: "files_data"
                };

                let getdata_json_data = JSON.stringify(get_data); // 将表单数据转换为 JSON 格式
                Send_Post(getdata_json_data, "http://127.0.0.1:8000/get_data").then(function (result) {
                    console.log(result)
                    Show_data(serverResponse, result)
                }).catch(function (error) {
                    console.log(error)
                    Show_data(serverResponse)
                });
            }
        }).catch(function (error) {
            console.log(error)
        });
    })

    let formData_history = {
        user_id: sessionStorage.getItem('username'),
        table: "history"
    };
    let jsonData_history = JSON.stringify(formData_history); // 将表单数据转换为 JSON 格式
    Send_Post(jsonData_history, "http://127.0.0.1:8000/get_data").then(function (result) {
        let ul = document.getElementById("left_ul");
        result.forEach(function (item) {
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(item['history_data']))
            ul.appendChild(li);
        })
        let li_click = document.getElementById("left_ul").querySelectorAll("li")
        li_click.forEach(function (item) {
            item.addEventListener("click", function () {
                let formData_path = {
                    path: item.innerText // 将输入的值放入"path"字段中
                };
                let jsonData = JSON.stringify(formData_path)
                Send_Post(jsonData, "http://127.0.0.1:8000/get_path").then(function (result) {
                    let formData2 = {
                        user_id: sessionStorage.getItem('username'), // 将输入的值放入"path"字段中
                        file_path: item.innerText,
                        table: "files_data",
                    };
                    console.log(formData2)
                    let jsonData2 = JSON.stringify(formData2); // 将表单数据转换为 JSON 格式
                    Send_Post(jsonData2, "http://127.0.0.1:8000/get_data").then(function (results) {
                        Show_data(result, results)
                    }).catch(function (error) {
                        console.log(error)
                    });
                }).catch(function (error) {
                    console.log(error)
                });
            })
        });
    }).catch(function (error) {
        console.log(error)
    });

    document.addEventListener('click', function (event) {
        if (!editPanel.contains(event.target)) {
            editPanel.style.display = 'none';
            thumbnailsWrapper.style.width = '100%';
            editTextarea.value = '';
        }
    });
    get_html_data()
    document.getElementById("show_hide").addEventListener("click",function(){
        console.elo
    })
})

document.getElementById("a_history").addEventListener("click", function () {
    let x = document.getElementById("left_ul").querySelectorAll("li")
    for (let i = 0; i < x.length; i++) {
        if (x[i].style.display === "none") {
            x[i].style.display = "block";
        } else {
            x[i].style.display = "none";
        }
    }
});

topnav_search.addEventListener("click", function () {
    let searchs = document.getElementsByName('searchs')[0].value
    let searchs_data = {
        search_data: searchs,
        user_id: sessionStorage.getItem('username')
    }
    console.log(searchs_data)
    let search_data_json = JSON.stringify(searchs_data); // 将表单数据转换为 JSON 格式
    Send_Post(search_data_json, "http://127.0.0.1:8000/search").then(function (result) {
        console.log(result)
        search_Show_data(result)
    }).catch(function (error) {
        console.log(error)
    });
})

/* 当用户点击头像时，切换下拉菜单的显示和隐藏 */
myDropdown[0].addEventListener("click",function(){
    let s = document.getElementById("user").querySelectorAll('li')
    s.forEach(function (item){
        if(item.style.display=="none"){
            item.style.display='block';
        }
        else{
            item.style.display="none"
        }
    })
})

