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
UNLINK                      异步删除，有内部优化，小key退化为同步删除，大key异步删除，避免阻塞引起的业务雪崩,4.0之前用expire里面过期替代
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
HSET    4.0以上redis版本可以直接hset多个字段，hmset就被标记为删除，4.0之前使用hmset

HSETNX

HGET

HMGET

HGETALL 会阻塞，不要get value很大的key

HKEYS   和keys一样,不过只是扫描单个key里面的字段，一般不会卡顿，key太多后用hscan

HVALS

HDEL

HEXISTS

HLEN

HINCRBY

HINCRBYFLOAT
HSCAN
## List 
当作队列或者栈好用
LPUSH key value [value...] 从头部（左侧）插入一个或多个元素
RPUSH key value [value...] 从尾部（右侧）
LPOP key [count] 从头部移除并返回元素(可指定数量)
RPOP key [count] 从尾部
LLEN key    返回列表长度
LRANGE key start stop 返回指定范围内的元素 0到7 -8到-1
LINDEX key index 通过下标访问元素
LSET key index value 设置指定元素的值
LINSERT key BEFORE|AFTER pivot value 在指定元素前/后插入元素
LREM key count value 删除指定值的元素（count 控制删除数量）
LTRIM key start stop 保留范围内制定的元素，用于限定范围的队列
BLPOP key [key ...] timeout 阻塞式从头部弹出，无元素则等待
BRPOP key [key ...] timeout 阻塞式从尾部弹出，无元素则等待
RPOPLPUSH source dest   原子操作两个redis list从source尾部弹出，插入dest头部
LMOVE source dest LEFT|RIGHT LEFT|RIGHT 原子性移动元素（Redis 6.2+，替代 RPOPLPUSH），可以指定头部尾部
BLMOVE source dest LEFT|RIGHT LEFT|RIGHT timeout    阻塞版 LMOVE（Redis 6.2+）
LMPOP numkeys key [key ...] LEFT|RIGHT [COUNT count]    从多个列表中弹出元素（Redis 7.0+）
索引规则：0 是头部第一个，-1 是尾部最后一个，负数从右边开始数
BLPOP/BRPOP 的 timeout：0 表示永久阻塞，正数表示阻塞秒数
LREM 的 count：count > 0 从头部删，count < 0 从尾部删，count = 0 删全部
底层结构：Redis 3.2+ 列表底层使用 quicklist（ziplist + 双向链表），兼顾内存和性能
阻塞式指令可以用于非安全要求的轻量级消息队列，因为用完就删除，可能丢数据
```


