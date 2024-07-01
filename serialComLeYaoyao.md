# 整体说明
(帧头)(命令长度)(索引)(命令)(子命令)(唯一码)(校验)(帧尾)
AA0A01D101(6位HEX String)(CheckSum)DD\
eg. AA0A01D101303831353530D3DD\
帧头: AA\
CheckSum范围: (命令长度)(索引)(命令)(唯一码)\
CheckSum值: D3\
帧尾: DD

## 主板状态查询(启动申请)
### APP --> 主板
AA0A01D101(6位HEX String)(CheckSum)DD\
**6位Hex String**: 303831353530 (081550) 代表8点15分50秒, 用时间做为幂等码\
eg.\
AA0A01D101(303831353530)(D3)DD\
AA0A01D101303831353530D3DD

### 主板 --> APP
AA0B02D101(6位HEX String)(主板状态)(CheckSum)DD\
**主板状态**: 01-> 待支付, 00 -> 离线\
eg. \
AA0B02D101(303831353530)(**_01_**)(D1)DD\
AA0B02D10130383135353001D1DD

## 命令:出币
### APP --> 主板
**金额**: 
AA0E01D102(6位HEX String)(金额)(出币数)(CheckSum)DD\
eg. \
AA0E01D102(303831353530)(0A0A)(0A0A)(D7)DD\
AA0E01D1023038313535300A0A0A0AD7DD
### 主板 --> APP
AA0F02D102(6位HEX String)(金额)(结果)(出币数)(CheckSum)DD\
eg. \
AA0F02D102(303831353530)(0A0A)(01)(0A0A)(D6)DD\
AA0F02D1023038313535300A0A010A0AD6DD
