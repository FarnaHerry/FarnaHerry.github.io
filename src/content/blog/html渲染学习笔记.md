---
title: html渲染学习笔记
author: farna
description: 记录一下个人学习html渲染笔记
pubDate: 2026-06-30 12:00:00
relatedPosts: []  # 添加这一行，暂时设为空数组
---

## 解析html
HTML文本
 ↓
HTML Parser
 ↓
DOM Tree
HTML 解析过程中，浏览器的预加载扫描器会提前发现资源（CSS、JS、图片等）并发起请求，提高加载速度。css不会影响主渲染线程一直往下读取,但是遇到js，主线程就需要阻塞了，因为js可能会修改dom，css虽然不会直接阻塞主线程，但是js有些操作需要知道css属性，此时css会间接阻塞
### dom
先生成C++对象，通过绑定层生成JS可以访问的对象
Node(C++)
 |
Wrapper
 |
JS对象
### csson
CSS文本
 ↓
CSS Parser
 ↓
CSSOM Tree然后进行复杂的渲染
css的来源有很多，浏览器默认就有一些，定义了div是display block等等
会计算出来每个节点的样式，通过浏览器可以看到，计算后的样式也就是最终样式，会让html元素的所有属性都有值，浏览器会计算出 computed style，部分属性会进一步在布局阶段得到最终 used value
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
    <!-- 
        Text Node
        ↓
        Anonymous Inline Box（逻辑概念）
        ↓
        Line Box（布局阶段生成）
 -->
    2

    <p>3</p>
</div>
```
CSS 规范描述的是逻辑上的盒模型（Box Tree）和格式化模型（Formatting Model），浏览器内部的 Layout Tree 是具体实现，两者并不一定一一对应。浏览器只需要保证最终布局结果符合 CSS 规范，因此源码中不一定真的存在与规范完全对应的 C++ 对象。
### 分层layer
现代浏览器通过分层减少修改，优化性能，浏览器内部自己根据策略进行分层，和堆叠上下文相关的属性会影响到分层，不过也不一定，比如z-index,opacity之类的。
滚动条也会单独分出来一层。

开发者可以通过一些属性帮助浏览器做优化：

transform：最推荐用于移动、缩放、旋转动画，通常可以只触发合成。
opacity：透明度动画通常也只触发合成。
will-change：提示浏览器某些属性即将变化，可提前进行优化，但应按需使用，避免长期滥用，因为会增加内存占用。
contain：限制布局或绘制影响范围，减少重排和重绘传播。
某些元素（如 position: fixed、<video>、<canvas> 等）浏览器也可能自动提升为独立图层。
```css
.box{
    will-change: opacity;
}
.box{
    will-change: transform;
}
```
这种css会告诉浏览器，某些东西即将修改
### 绘制Paint
根据Layout Tree生成绘制指令，现代浏览器生成方式更加复杂，还带有自己的优化
Layout
 ↓
Paint
 ↓
生成Display Item / Paint Chunk
 ↓
Compositing决策
 ↓
Compositor Layer
### 分块Tiling
Compositor Layer
        |
        ↓
Layer bounds
        |
        ↓
Tile Grid
Tile 是按照空间区域切
例如:
+----+----+
| T1 | T2 |
+----+----+
| T3 | T4 |
+----+----+
### 光栅化Raster
Compositor Thread
        |
        | 生成 Raster Task
        ↓
Raster Worker Threads
        |
        | 选择 CPU Raster 或 GPU Raster
        ↓
产生 Tile Bitmap / Texture
        |
        ↓
Composite
先生成任务，根据实际系统资源和浏览器自身的策略，选择CPU还是GPU处理
### 画Draw
在这里处理transform，此时生成一个指引(quad)信息，指引标识出每个位图应该画到屏幕的哪个位置，考虑变形缩放之类的东西，变形发生在合成线程，是transform效率高的本质原因，和渲染主线程无关，合成线程把quad提交给GPU进程，由GPU进程调用系统，提交给GPU硬件，完成最后的屏幕成像，因为渲染进程在沙盒中运行，自己本身无法去访问GPU。
ps:GPU进程不一定是访问GPU，是一个用户态的进程，管理渲染
### reflow
js修改了布局属性，引起上述链条从布局开始重新渲染计算，浏览器都有优化，会等js都执行完成后统一发送到任务队列中，是异步的，但是如果后续的js直接访问了一些layout属性，会导致同步立即执行，因为需要实时知道属性，不然会导致属性逻辑错误
### repaint
js修改了可见样式后，导致从paint链条开始的重新渲染
### transform
transform是在最后Draw处理，并且这个是在合成线程，不影响主线程，主线程阻塞情况下都可以使用，所以transform很快，并且也在链条最后，影响范围明显比上两个更加小