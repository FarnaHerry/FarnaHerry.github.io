---
title: html渲染学习笔记
author: farna
description: 记录一下个人学习html渲染笔记
pubDate: 2026-06-30 12:00:00
relatedPosts: []  # 添加这一行，暂时设为空数组
---

## 解析html
通过url获取到html文本，然后解析为dom和csson树，然后进行复杂的渲染
html标签解析的时候，全都解析为
预处理线程会通过网络下载css的link，js之类的，预先处理一些，css不会影响主渲染线程一直往下读取,但是遇到js，主线程就需要阻塞了，因为js可能会修改dom
### dom
把纯文本的html标签都处理为一个一个的cpp对象，再包装一层能让js访问
### csson
css的来源有很多，浏览器默认就有一些，定义了div是display block等等