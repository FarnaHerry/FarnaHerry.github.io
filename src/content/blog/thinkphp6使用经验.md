---
title: thinkphp6使用经验
author: farna
description: 记录一下个人使用thinkphp的经验
pubDate: 2026-06-19 12:00:00
relatedPosts: []  # 添加这一行，暂时设为空数组
---

## 踩坑
### 环境差异
1. windows不区分大小写，当时本地注册局部异常处理工具到provider.php文件使用的是大写开头，windows可以读取，linux实际环境中完全不生效，debug一整天才发现。
2. windows本地开发直接传输的逻辑值true/false,本地开发正常，生产环境中，true/false可能被网关识别不正常，传输的时候被丢弃之类的，导致生产环境参数校验失败，后续开发统一使用1/0代替true/false。
3. 内部系统防火墙规则，项目上线才发现，防火墙完全拦截除了get/post以外的请求，restful风格基本不可用，协同前端修改请求规范，采用中间件拦截post请S求，重写为对应的delete/put等请求解决，后续新开发项目不使用restful风格。
4. openssl版本
对接很多国家系统，都是要求使用sm4加密，默认的sm4加密基于openssl的较高高版本，依然是本地windows开发时版本可用，生产环境的openssl版本较低，无法直接使用，生产环境的composer也坏了，无法下载第三放纯php实现库，所以自己本地下载，然后直接复制php实现代码到对应目录，也可以手动写autoload，我害怕影响其他代码，直接手动复制了，前辈们的做法是使用include直接引入文件。
### 重构踩坑
1. 接口返回类型
后端返回的结构类似于
```php
return ["code"=>0,"msg"=>"success","data"=>[]];
```
老前端使用jquery请求可以直接获取，重构为vite+vue,使用axios,请求的时候触发报错，f12查看浏览器网络请求中发现，有请求头Accept: application/json,重构项目的封装中没有发送该请求头导致框架没有解析到，直接返回数组报错，所以该框架的返回值一定程度上也依赖于请求头，有以上请求头就会自己按照json返回，否则会解析为数组报错。新的接口开发应使用官方推荐的助手函数返回json,而不是依赖于请求方添加请求头。
```php
return json($data);
```
