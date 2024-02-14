function toggleForm() {
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

document.getElementById('login').addEventListener('submit', function (e) {
    e.preventDefault();
    var formData = new FormData(this);
    var formData = {
        user_id: document.getElementsByName('username')[0].value, // 将输入的值放入"path"字段中
        password: document.getElementsByName('password')[0].value
    };
    var jsonData = JSON.stringify(formData); // 将表单数据转换为 JSON 格式
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response['status'] == "success") {
                    // 将用户名作为 cookie 设置
                    // document.cookie = "username=" + encodeURIComponent(formData.user_id) + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
                    sessionStorage.setItem('username', formData.user_id);
                    // 提交成功后重定向到另一个页面
                    var formData2 = {
                        user_id: sessionStorage.getItem('username'),
                        table: "history"
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
                                // 将服务器响应存储在本地存储中
                                sessionStorage.setItem('history_data', JSON.stringify(response));
                                // 提交成功后重定向到另一个页面
                                window.location.href = "index.html";
                            } else {
                                console.error('Error:', xhr2.statusText);
                            }
                        }
                    };

                    xhr2.send(jsonData2);
                }
                else if (response['status'] == "用户名不存在") {
                    document.getElementById('loginMessage').innerText = "用户名不存在";
                }
                else if (response['status'] == "密码错误") {
                    document.getElementById('loginMessage').innerText = "密码错误";
                }
                else if (response['status'] == 'fail') {
                    document.getElementById('registerMessage').innerText = "error";
                }
            } else {
                console.error('Error:', xhr.statusText);
            }
        }
    };

    xhr.send(jsonData);
});

document.getElementById('register').addEventListener('submit', function (e) {
    e.preventDefault();
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var formData = new FormData(this);
    var formData = {
        user_id: [document.getElementsByName('re_username')[0].value], // 获取用户名输入框的值
        password: [document.getElementsByName('re_password')[0].value], // 获取密码输入框的值
        confirmpassword: [document.getElementsByName('confirmPassword')[0].value]
    };
    var jsonData = JSON.stringify(formData); // 将表单数据转换为 JSON 格式
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/register", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response['status'] == "success") {
                    // 将服务器响应存储在本地存储中
                    // sessionStorage.setItem('serverResponse', JSON.stringify(response));
                    loginForm.style.display = 'block'; // 显示登录表单
                    registerForm.style.display = 'none'; // 隐藏注册表单
                }
                else if (response['status'] == "用户名重复") {
                    // 显示用户名重复的错误信息
                    document.getElementById('registerMessage').innerText = "用户名已存在，请尝试其他用户名";
                }
                else if (response['status'] == "两次输入密码不一样") {
                    document.getElementById('registerMessage').innerText = "两次输入密码不一样";
                }
                else if (response['status'] == 'fail') {
                    document.getElementById('registerMessage').innerText = "error";
                }
            } else {
                console.error('Error:', xhr.statusText);
            }
        }
    };

    xhr.send(jsonData);
});