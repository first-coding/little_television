document.getElementById("myForm").addEventListener("submit", function(event) {
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
              // 提交成功后重定向到另一个页面
              window.location.href = "file.html";
          } else {
              console.error('Error:', xhr.statusText);
          }
      }
  };

  xhr.send(jsonData);
});