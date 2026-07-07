---
title: Redis学习笔记
author: farna
description: 记录一下个人Redis学习笔记
pubDate: 2026-07-07 12:00:00
relatedPosts: []  # 添加这一行，暂时设为空数组
---

记录一下常用指令
## Key
```redis
DEL key                     删除
EXISTS key                  是否存在
EXPIRE key seconds          设置过期
PEXPIRE key ms              毫秒过期
TTL key                     剩余秒
PTTL key                    剩余毫秒
PERSIST key                 取消过期

RENAME key newKey           重命名
RENAMENX                    不存在才重命名

TYPE key                    查看类型

SCAN                        遍历，生产环境使用
KEYS pattern                查询Key（生产慎用，会阻塞扫描，仅开发测试使用）

RANDOMKEY                   随机Key
MOVE                        移动数据库
COPY                        复制Key
UNLINK                      异步删除
```
## String
```redis
SET key value

GET key

MSET

MGET

SETEX

PSETEX

SETNX

GETSET

GETEX

GETDEL

APPEND

STRLEN

GETRANGE

SETRANGE

INCR

INCRBY

INCRBYFLOAT

DECR

DECRBY
```
## Hash
```redis
HSET

HSETNX

HGET

HMGET

HGETALL

HKEYS

HVALS

HDEL

HEXISTS

HLEN

HINCRBY

HINCRBYFLOAT

HSCAN
```