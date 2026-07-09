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
会计算出来每个节点的样式，通过浏览器可以看到，计算后的样式也就是最终样式，会让html元素的所有属性都有值，所有相对值都计算成绝对值
### lyaout
Layout Tree 与 DOM Tree 并非一一对应。display:none 的元素（如 head、link 等默认不参与布局的元素）不会生成 Layout Object，因此不会出现在 Layout Tree 中；而 ::before、::after 等伪元素虽然不存在于 DOM Tree 中，却会生成对应的布局对象。此外，浏览器为了满足布局规则，还会创建匿名布局对象（Anonymous Box），因此 Layout Tree 中可能出现 DOM Tree 中不存在的节点。文本节点会生成匿名 inline box，并参与 line box 的构建。当一个块级容器同时包含块级元素和直接的内联内容时，浏览器会自动创建匿名 block box，将连续的内联内容包裹起来，使布局树满足 CSS 布局模型。Layout Tree 本质上是浏览器内部的 C++ 布局对象，负责保存元素的几何信息（位置、尺寸等），JavaScript 无法直接访问 Layout Tree，只能通过 DOM 提供的接口（如 offsetWidth、clientHeight、getBoundingClientRect() 等）间接获取浏览器计算出的布局信息。
```html
<div>
    <p>1</p>

    <!-- 文本节点最终会参与 line box 的构建。
         由于 div 同时包含块级元素(p)和直接的内联内容，
         浏览器会创建一个 anonymous block box，
         将连续的内联内容(这里是文本2)包裹起来，
         然后在该匿名块盒内部建立 line box 完成排版。 -->

    2

    <p>3</p>
</div>
```
CSS 规范描述的是逻辑上的盒模型（Box Tree）和格式化模型（Formatting Model），浏览器内部的 Layout Tree 是具体实现，两者并不一定一一对应。浏览器只需要保证最终布局结果符合 CSS 规范，因此源码中不一定真的存在与规范完全对应的 C++ 对象。
### 分层layer
现代计算机通过分层减少修改，优化性能，浏览器内部自己根据策略进行分层，和堆叠上下文相关的属性会影响到分层，不过也不一定，比如z-index,opacity之类的，滚动条也会单独分出来一层