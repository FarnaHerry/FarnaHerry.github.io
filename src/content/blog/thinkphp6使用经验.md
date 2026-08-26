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
3. 内部系统防火墙规则，项目上线才发现，防火墙完全拦截除了get/post以外的请求，restful风格基本不可用，协同前端修改请求规范，采用中间件拦截post请S求，重写为对应的delete/put等请求解决，后续新开发项目不强行使用restful风格，使用语义类似的get/post。
4. openssl版本
对接很多国家系统，都是要求使用sm4加密，默认的sm4加密基于openssl的较高高版本，依然是本地windows开发时版本可用，生产环境的openssl版本较低，无法直接使用，生产环境的composer也坏了，无法下载第三放纯php实现库，所以自己本地下载，然后直接复制php实现代码到对应目录，也可以手动写autoload，为了避免影响其他代码，我选择直接手动复制，同事的做法是使用include直接引入文件。
5. mysql版本差异
多个分公司mysql版本不一样，最低甚至是mysql5.5，基本一点高级特性都不可用，被迫纯基础sql重写，好在sql代码不是很困难，手动重写即可。
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
1. 权限开发
因为第一次使用thinkphp开发不够熟悉，以及php版本的限制（7.4），没有php8的#注解，只有phpdoc，最开始权限使用url，也就是路由权限，感觉不够灵活，强依赖于路由表，比较难以使用，最后选择使用phpdoc+自定义注解解决。同样是为了避免依赖，没有用第三方phpdoc处理包，实际上是有这个包的，选择直接自己实现，更加可控。约定基础doc格式：
```php
/**
 * @desc 描述
 * @perm 模块:资源:操作
 */
public function name(){
}

```
部分伪代码：
```php
    //读文件
    $sourceCode = file_get_contents($filePath);
    if ($sourceCode === false) {
        return [];
    }
    /*
    * token_get_all() 返回的每个元素有两种结构：
    *
    *   1. 数组 token（关键字/标识符/字面量）：
    *      [token_id, "字符串值", 行号]
    *      例：T_CLASS       → [365, "class", 24]
    *          T_PUBLIC      → [342, "public", 30]
    *          T_DOC_COMMENT → [368, "/** @perm ... *\/", 29]
    *
    *   2. 字符串 token（单个符号）：
    *      直接返回原始字符，如 "{"、"}"、"("、";"
    *      这些不是数组，因此需要 is_array() 判断
    */
    $tokens = token_get_all($sourceCode);
    $count = count($tokens);
    $result = [];

    $resource = null;        // 类级注释首行 → resource 名
    $currentDoc = null;      // 当前遇到的 phpdoc
    $pendingFunction = false;// 下一个 function 是否属于当前 doc
    if (!is_array($token)) {
        $pendingFunction = false;
        continue;
    }
    for ($i = 0; $i < $count; $i++) {
        $token = $tokens[$i];
        //使用官方定义的常量匹配处理每个token
        switch($token[0]){
            
            case T_DOC_COMMENT:
                //此处是读取到phpdoc部分了，一块phpdoc被token分成一整块，不会拆为多行
                //读取到的基本就是以下文本
                /**
                 * @desc 描述
                 * @perm 模块:资源:操作
                 */
                $currentDoc      = $token[1];
                $pendingFunction = true;
                break;
            case T_PUBLIC: 
                //此时已经找到public函数，结合之前获取的phpdoc处理
                //使用正则匹配一下想要的注解
                preg_match('/@perm\s+([\w:-]+)/', $currentDoc, $m);
                $permCode=m[1];
                preg_match('/@desc\s+([\w:-]+)/', $currentDoc, $m);
                $permName=m[1];
                //TODO,使用自己的方式持久化权限code和name
                write($permCode=m[1],$permName=m[1]);
                //用标识符反写，能让控制器找到对应的权限code
                //扫描控制器文件的时候，本身就可以读取控制器名字
                //此case匹配到了public，后续就是fucntion name
                //往后读取到name就是action
                rewrite($controllerName+$action,$permCode);
                break;
            default:
                break;
        }
    }
```
