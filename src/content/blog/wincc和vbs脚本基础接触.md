---
title: wincc和vbs脚本基础接触
author: farna
description: 记录下工作中使用经验
pubDate: 2026-06-29 12:00:00
relatedPosts: []  # 添加这一行，暂时设为空数组
---

## vbs脚本
轻度接触，基本上就是复制前辈的模板，修改最后post请求的参数和数据
基础请求
```vbs
Dim http, url, response
' 创建对象
Set http = CreateObject("MSXML2.XMLHTTP")
' 设置URL（可以带参数）
url = "http://www.baidu.com"
'false为同步，true为异步
http.open "GET",url,false
http send
'检测状态
http.status
' 获取响应
response = http.responseText
' 输出结果
MsgBox response


url="www.baidu.com"
http.open "POST",url,false
' 设置JSON格式
http.setRequestHeader "Content-Type", "application/json"
' JSON数据
jsonData = "{""name"":""张三"",""age"":25,""city"":""北京""}"
http.send jsonData
MsgBox http.responseText
```