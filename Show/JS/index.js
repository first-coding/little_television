var history_data = sessionStorage.getItem('history_data')
var optionsData = JSON.parse(history_data);
function generateOptions() {
    var datalist = document.getElementById('options');
    // Clear existing options
    datalist.innerHTML = '';
    optionsData.forEach(function (option) {
        var optionElement = document.createElement('option');
        optionElement.value = option.history_data;
        datalist.appendChild(optionElement);
    });
}

// Call the function to generate options when the page loads
window.onload = generateOptions;
document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault(); // 阻止表单默认提交行为
    var formData = {
        path: document.getElementById("inputField").value // 将输入的值放入"path"字段中
    };

    var jsonData = JSON.stringify(formData); // 将表单数据转换为 JSON 格式

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/get_path", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log('Response:', response);
                // 将服务器响应存储在本地存储中
                sessionStorage.setItem('serverResponse', JSON.stringify(response));
                // 提交成功后,继续请求
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
                            console.log('Response:', response);
                            sessionStorage.setItem('data', JSON.stringify(response));
                            // 提交成功后, 插入数据库
                            var formData3 = {
                                data: {
                                    user_id: [sessionStorage.getItem('username')],
                                    history_data: [document.getElementsByName('inputField')[0].value]
                                },
                                table: "history"
                            };

                            var jsonData3 = JSON.stringify(formData3); // 将表单数据转换为 JSON 格式
                            var xhr3 = new XMLHttpRequest();
                            xhr3.open("POST", "http://127.0.0.1:8000/update_data", true);
                            xhr3.setRequestHeader("Content-Type", "application/json");

                            xhr3.onreadystatechange = function () {
                                if (xhr3.readyState === XMLHttpRequest.DONE) {
                                    if (xhr3.status === 200) {
                                        var response = JSON.parse(xhr3.responseText);
                                        console.log('Response:', response);
                                        // 将服务器响应存储在本地存储中
                                        // window.location.href = "file.html";
                                    } else {
                                        console.error('Error:', xhr3.statusText);
                                    }
                                }
                            };

                            xhr3.send(jsonData3);
                        } else {
                            console.error('Error:', xhr2.statusText);
                        }
                    }
                };

                xhr2.send(jsonData2);

            } else {
                console.error('Error:', xhr.statusText);
            }
        }
    };

    xhr.send(jsonData);
});