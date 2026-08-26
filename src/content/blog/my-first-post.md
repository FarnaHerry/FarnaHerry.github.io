---
title: 学习使用astro和github pages搭建个人博客
author: farna
description: 测试文章
pubDate: 2026-06-13 12:00:00
relatedPosts: []  # 添加这一行，暂时设为空数组
---

## astro
使用pnpm创建astro基础模板，然后再使用astro创建一个博客模板。在查看astro文档的基础上参考博客模板代码，基础复刻一下博客模板，就对astro有了一个基础的了解。博客模板的关键点是使用```[...slot]```动态路由处理资源路径，再搭配```getCollection()```获取已经有的容器的数据来填充每个路由。
如果想快速上手，直接使用astro的博客模板即可。
## github pages
1. 注册了github账号 
2. 创建一个public仓库，命名为[我们的具体name].github.io，例：FarnaHerry.github.io
3. 把我们的astro项目推上去
4. 在我们的仓库页面的顶部栏上点击Settings
5. 点击侧边栏的Pages
6. Build and deployment区域下的Source改为Github Actions
7. 点击顶部栏的Actions
8. 点击左侧的New workflow
9. 搜索框输入astro,检索到后选择
10. 此时会创建一个.github/workflows/astro.yml文件，根据自己具体的环境做修改，然后作为actions使用，根据自身环境调试bug结束后，就可以实现推送代码后自动更新页面