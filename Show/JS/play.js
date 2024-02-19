// 从sessionStorage中获取视频路径
var decodedUri = decodeURI(sessionStorage.getItem('videoSrc'));
var html_data = JSON.parse(sessionStorage.getItem('html_data'));
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

function right_Show_data(right_data) {
    if (right_data) {
        let right_info = document.querySelector('.info')
        right_data.forEach(function (item) {
            let right_div = document.createElement('div');
            right_div.className = 'right_data'
            let video = document.createElement("video");
            video.src = item["file_path"]
            video.controls = false;
            right_div.appendChild(video);

            let pDiv = document.createElement("div");
            pDiv.className = "pdiv_show"
            let p1 = document.createElement("p");
            let p1_file_name = item["file_name"].split("/")
            p1.textContent = p1_file_name[p1_file_name.length - 1].split(".")[0]
            pDiv.append(p1);
            let p2 = document.createElement("p")
            p2.textContent = item["description"]
            pDiv.appendChild(p2)

            right_div.appendChild(pDiv);
            right_info.appendChild(right_div)

        })
    }
}

function search_Show_data(searchs_data) {
    var elements = document.getElementById("contains");
    console.log(elements)
    elements.innerHTML = ""
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
            elements.appendChild(div)
        })
    }
}
function Show_play(play_data, play_src) {
    if (play_src) {
        var videoElement = document.querySelector('video');
        videoElement.src = play_src;
    } else {
        console.error('Video source not found.');
    }
    let targetObject = play_data.find(obj => obj.file_path === play_src);
    let pElement = document.querySelector('.text').querySelectorAll('p')
    for (let i = 0; i < pElement.length; i++) {
        pElement[0].innerText = targetObject["file_name"]
        pElement[1].innerText = targetObject["description"]
    }
}
function flash_play(flash_data){
    let videos_flash = document.querySelector('.video-container')
    videos_flash.getElementsByTagName('video')[0].src=flash_data['videoSrc']
    let pElement = document.querySelector('.text').querySelectorAll('p')
    for (let i = 0; i < pElement.length; i++) {
        pElement[0].innerText = flash_data["file_name"]
        pElement[1].innerText = flash_data["description"]
    }
}
right_Show_data(html_data)
Show_play(html_data, decodedUri)
document.addEventListener("DOMContentLoaded", function () {
    let get_data = {
        user_id: sessionStorage.getItem('username'), // 将输入的值放入"path"字段中
        table: "files_data"
    };

    let getdata_json_data = JSON.stringify(get_data); // 将表单数据转换为 JSON 格式
    Send_Post(getdata_json_data, "http://127.0.0.1:8000/get_data").then(function (result) {
        // let targetObject = result.find(obj => obj.file_name === decodedUri);
        // Show_play(targetObject)
        console.log(result)
        // right_Show_data(result)
    }).catch(function (error) {
        console.log(error)
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
    // 获取所有类名为 'right_data' 的元素
    let elements = document.getElementsByClassName('right_data');

    // 将类数组对象转换为数组
    let elementsArray = Array.from(elements);


    // 使用 forEach 给每个元素添加点击事件，并获取元素中的 video 标签的 src 属性和两个 p 标签的文本内容
    elementsArray.forEach(function (element) {
        element.addEventListener("click", function () {
            // 获取 video 标签的 src 属性
            let videoSrc = element.getElementsByTagName('video')[0].src;
            // 获取两个 p 标签的文本内容
            let pTexts = Array.from(element.getElementsByTagName('p')).map(p => p.textContent);
            // 将结果保存为 JSON 格式
            let result = {
                videoSrc: videoSrc,
                file_name: pTexts[0],
                description: pTexts[1]
            };
            flash_play(result)
        })
    });
    document.getElementById("left").style.display = "none"
    document.getElementById("show_hide").addEventListener("click", function () {
        // console.log(document.getElementsByClassName("right")[0].offsetHeight)
        if (document.getElementById("left").style.display != "none") {
            document.getElementById("left").style.display = "none"
        }
        else {
            document.getElementById("left").style.display = "block"
        }
    })
})