// 从sessionStorage中获取视频路径
var decodedUri = decodeURI(sessionStorage.getItem('videoSrc'));
var html_data = JSON.parse(sessionStorage.getItem('html_data'));
console.log(html_data)
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

function right_Show_data(right_data){
    if(right_data){
        let right_info = document.querySelector('.info')
        right_data.forEach(function (item){
            let right_div = document.createElement('div');
            right_div.className='right_data'
            let video = document.createElement("video");
            video.src = item["file_path"]
            video.controls=false;
            right_div.appendChild(video);

            let pDiv = document.createElement("div");
            pDiv.className = "pdiv_show"
            let p1 = document.createElement("p");
            let p1_file_name = item["file_name"].split("/")
            p1.textContent = p1_file_name[p1_file_name.length-1].split(".")[0]
            pDiv.append(p1);
            let p2 = document.createElement("p")
            p2.textContent = item["description"]
            pDiv.appendChild(p2)

            right_div.appendChild(pDiv);
            right_info.appendChild(right_div)

        })
    }
}
right_Show_data(html_data)

function search_Show_data(searchs_data){
    var elements = document.getElementById("contains");
    console.log(elements)
    elements.innerHTML=""
    if(searchs_data){
        // 创建大框容器
        let wrapperDiv = document.createElement('div');
        wrapperDiv.id = 'thumbnailsWrapper2';
        searchs_data.forEach(function (item){
            
            let div = document.createElement("div");
            div.className = "search_show"
            let video = document.createElement("video");
            video.src = item["file_name"]
            video.controls=false;
            div.appendChild(video);

            let pDiv = document.createElement("div");
            pDiv.className = "pdiv_show"
            let p1 = document.createElement("p");
            let p1_file_name = item["file_name"].split("/")
            p1.textContent = p1_file_name[p1_file_name.length-1].split(".")[0]
            pDiv.append(p1);
            let p2 = document.createElement("p")
            p2.textContent = item["description"]
            pDiv.appendChild(p2)

            div.appendChild(pDiv);
            elements.appendChild(div)
        })
    }
}
function Show_play(play_data){
    console.log(play_data)
    let pElement = document.querySelector('.text').querySelectorAll('p')
    let split_data = play_data["file_name"].split("/")
    for(let i=0;i<pElement.length;i++){
        pElement[0].innerText=split_data[split_data.length-1]
        pElement[1].innerText=play_data["description"]
    }
}
document.addEventListener("DOMContentLoaded", function () {
    // // 如果视频路径存在，则设置视频源
    if (decodedUri) {
        var videoElement = document.querySelector('video');
        videoElement.src = decodedUri;
    } else {
        // 如果视频路径不存在，则显示错误信息
        console.error('Video source not found.');
    }

    let get_data = {
        user_id: sessionStorage.getItem('username'), // 将输入的值放入"path"字段中
        table: "files_data"
    };

    let getdata_json_data = JSON.stringify(get_data); // 将表单数据转换为 JSON 格式
    Send_Post(getdata_json_data, "http://127.0.0.1:8000/get_data").then(function (result) {
        console.log(result)
        let targetObject = result.find(obj => obj.file_name === decodedUri);
        Show_play(targetObject)
        // right_Show_data(result)
    }).catch(function (error) {
        console.log(error)
    });
})

topnav_search.addEventListener("click",function(){
    let searchs = document.getElementsByName('searchs')[0].value
    let searchs_data = {
        search_data:searchs,
        user_id:sessionStorage.getItem('username')
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