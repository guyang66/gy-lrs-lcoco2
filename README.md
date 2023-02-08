# gy-lrs-lcoco2

## 简易版网页狼人杀（重新架构）

![](./preview/game1.gif)
![](./preview/game2.gif)

（完整的游戏过程预览可以到https://www.bilibili.com/video/BV1YT411d7DZ/?vd_source=7fff6dc840957e585b1311da4c5328b9）
原项目地址：https://github.com/guyang66/gy-lrs-lcoco
原项目由于沿用之前项目的架构，上下文是挂在单例application上的，每来一次请求，都会重置this.ctx，如果同一时间来多个请求，那么B请求就会把A请求覆盖掉，导致
A请求走到后面的中间件是获取的上下文是B的，这样就上下文错乱（尤其在长连接下多个用户刷新时）。所以上下文只能通过中间件的回调参数获取，并且一直往下传递。感兴趣的同学可以看看它的架构
```
   //server/application/index.js
   this.$app.use(async (ctx, next) => {
      // 每来一次请求，都会重置this.ctx
      this.ctx = ctx;
      await next()
    })
```

```
 // server/controller/gameController.js
 const { ctx } = app // 这样获取的ctx可能是错乱的，通过ctx.xxx的判断都会出问题（比如B请求ctx.header.authorization可能是A的），甚至cookie错乱
 
```
所以如果一个controller调用service，然后这个server中又调用另一个server...，那么ctx就必须从controller中一直往下面传递，很容易写丢失，维护起来也很头疼，现在需要调整架构。所以需要把ctx作为动态响应
参考eggjs架构(本项目架构也是借鉴eggjs源码架构设计而来)

### 项目简介
本项目是简易版的网页狼人杀游戏，是可以正常进行玩的，并非demo。本项目是前后端代码都在一个项目里，
前端：cra脚手架react + mobx + stylus + axios
后端：（nodejs）koa + mongodb

### 项目架构
```
├─ client                            客户端                       
    ├─ config                        
    ├─ public                        
    ├─ src                   
        ├─ api                       请求
        ├─ assets                    图片资源
        ├─ config                    react组件 
        ├─ helper                    辅助函数
        ├─ pages   
             ├─ login                登录页面
             ├─ views
                 ├─ room             房间/游戏页面
                 ├─ welcome          大厅页面
        ├─ router                    前端路由
        ├─ store                     mobx store 
        ├─ index.css   
        ├─ index.js          
├─ common                            公共类
├─ logs                              日志
├─ node_modules 
├─ preview                           预览 
├─ public                            前端build打包后的资源目录(给nginx起静态服务用的)
├─ server                            后端 
    ├─ application
        ├─ index.js                  实例初始化
        ├─ loader.js                 加载器
    ├─ base
        ├─ BaseClass                 基类
        ├─ MapClass                  懒加载辅助类（上下文）
    ├─ controller                    控制器
    ├─ extend                        扩展 
    ├─ middleware                    自定义中间件 
    ├─ mongoModel                    数据库model
    ├─ routes                        路由 
    ├─ schedule                      定时任务 
    ├─ service                       service类
    ├─ utils                         工具函数
├─ sql                               账号角色初始化sql
├─ .gitignore
├─ app.js                            后端启动入口文件
├─ config.json                       后端配置文件
├─ config-overrides.js               前端webpack配置文件
├─ package.json                      前后端依赖 
├─ README                             
```
### 开发(环境)-前端
```
npm run front
```
### 开发(环境)-后端
```
npm run server
```
### 启动
```
npm run dev
```
### 生产环境
```
// 打包前端代码，将打包到根目录的public目录下
npm run build
```

```
// 上传到服务器上，进入根目录（需要安装pm2和node环境）
npm run prd
```

```
// 配置nginx，将静态资源路径映射到根目录下的public目录，同时设置api代理。
```
nginx参考配置如下：
```
server {
        listen       80;
        server_name  www.yyyangyang.com;
        root         /usr/share/nginx/html;
        location / {
                root   html;
                index  index.html index.htm;
                # 80端口转到前端页面去
                proxy_pass http://localhost:6101/;
            }
    
            location /api/ {
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header REMOTE_HOST $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                root   html;
                index  index.html index.htm;
                # api接口转到6100 node服务去
                proxy_pass http://localhost:6100/api/;
            }
            error_page 404 /404.html;
                location = /40x.html {
            }
    
            error_page 500 502 503 504 /50x.html;
                location = /50x.html {
            }
    }
    
    # nginx 起一个静态服务，指向项目根目录的public目录
    server {
         listen 6101;
         server_name  gy-lrs-lcoco;
         charset utf-8;
         root /opt/workspace/gy-lrs-lcoco2/public/;
         location /{
         index  index.html index.htm;
         try_files $uri /index.html;
        }
    }
```

### 角色
1、admin（管理员）
功能：可以创建账号角色

2、host（主办/房主）
功能：可以创建房间、房间内踢人、推进游戏阶段、开始/（提前）结束游戏。

3、player（参与玩家）
功能：无
### 项目自玩测试
项目启动之后，使用多个浏览器或者微信调试工具又或者多个手机（如预览视频操作即可体验），在同一个局域网（wifi）下访问同一个域名即可模拟一起玩游戏，因为有长连接，所以要domain一样，要么都是192.xxx.xxx.xx + 端口号
要么localhost+端口号。

### 游戏线上体验
（项目已经部署到生产环境）
访问：http://120.48.51.123/  即可

账号如下：

| 账号   |  密码   | 昵称 | 角色 |
|  ----  |  ----  | ----  | ----  | 
| lrs  | 1  | 狼人杀管理员| 管理员 |
| super  | 1  | （登录之后参与游戏可自行修改昵称）| 房主 |
| host  | 1  | （登录之后参与游戏可自行修改昵称）| 房主 |
| player  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a1  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a2  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a3  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a4  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a5  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a6  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a7  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a8  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |
| a9  | 1  | （登录之后参与游戏可自行修改昵称）| 普通玩家 |

<font color="orange">注：建议登录管理员账号自行创建账号密码，避免多人游戏登录同一个账号，串游戏了。</font>
### 游戏规则介绍
为标准的9人狼人杀局（参考网页狼人杀9人局），分为三民、三神（预言家、女巫、猎人）、三狼
默认规则（不可配置的，如果需要可配置的请自行修改代码）：
1、女毒如果晚上毒死猎人，则猎人不能开枪
2、女巫晚上只能使用一瓶药，且解药用了之后，无法知晓当晚被刀的人是谁
3、狼人如果选择的目标如果是平票（比如分别刀了不同的三个人），则会随机选择一位玩家被刀，狼人也可空刀。
4、狼人自爆之后自动进入也晚。
5、猎人平时不能开枪（开枪按钮为灰色），当条件触发时才能发动技能（此时按钮变为橙色）
### 游戏功能
1、创建账号和指定角色（管理员角色）
2、创建房间（房主）
3、加入房间
4、房间内入座
5、修改昵称
6、游戏设置（房主）
7、踢人（房主）
8、开始游戏（房主）
9、进入游戏下一阶段（房主）
10、查看游戏记录
11、结束游戏（房主）
12、游戏复盘
13、再来一局（房主）
14、观战
15、其他游戏操作...
### 游戏玩法
面杀辅助用的，因为面杀的时候需要一个人当法官，而这个法官必须要有经验，保证游戏不出错，能顺利进行，如果交给系统来做，肯定是非常完美的（玩的时候就围在一起，如果没有单独的人当法官，就随便一个人既当主持人（维持游戏 正常进行，判定就交给系统去做就行，只需要照着公屏的字读然后在适当的时候进入下一阶段）又当玩家即可，晚上埋头看自己手机，适当操作即可）
面杀的缺点：
1、有时候刚好9个朋友在一起玩，结果差一个人当法官，就很尴尬

2、朋友聚会的时候想玩玩，但是大家都是新手，新手当法官稍不注意就会说错，一说错就导致游戏得重开，得不偿失，有了这个辅助器，新手也能当法官，只需要照着公屏念游戏进度和结果进行。

3、面杀投票的时候经常会有人迟迟不投，先看别人的票型再决定跟风投，所以采用系统推进阶段，只有在发言阶段才能交流，绝对公平。

4、有些新手比如拿到猎人，不清楚规则，晚上被女巫毒死不能开枪，白天直接就跳起来问法官是不是搞错了，为什么不能开枪巴拉巴拉，然后信息就暴露了给大家了，然后这局游戏就gg，系统来判定。

5、自动随机发牌，随机发言顺序，然后可以随时重开，省去时间，省去麻烦。

<font color="orange">面杀辅助用的，因为面杀的时候需要一个人当法官，而这个法官必须要有经验，保证游戏不出错，能顺利进行，如果交给系统来做，肯定是非常完美的（玩的时候就围在一起，如果没有单独的人当法官，就随便一个人既当主持人（维持游戏 正常进行，判定就交给系统去做就行，只需要照着公屏的字读然后在适当的时候进入下一阶段）又当玩家即可，晚上埋头看自己手机，适当操作即可）
</font>
### 游戏主要数据库表/model对象描述
1、action（server/mongoModel/action.js）
描述：主要记录每个玩家的关键操作/动作
* roomId: 房间id
* gameId: 游戏id
* day: 游戏进行到第几天
* stage: 游戏进行到某天的第几阶段
* from: 动作施加者
* to: 动作施加对象
* action: 动作描述
    *  assault: 狼人袭击
    *  kill: 狼人阵营刀死目标
    *  check: 预言家查验
    *  antidote: 女巫解药
    *  poison: 女巫毒药
    *  shoot: 猎人开枪
    *  boom: 狼人自爆
    *  vote: 投票流放
       2、game（server/mongoModel/game.js）
       描述: 游戏信息，比如游戏配置和游戏状态
* roomId: 房间id
* owner: 游戏创建者（主持人）
* status: 游戏状态
    *  1: 游戏进行中
    *  2: 游戏已结束
    *  3: 游戏异常（房主提前结束游戏或其他异常bug）
* stage: 游戏状态
    *  0: 幕布（准备进入夜晚/准备开始游戏）
    *  1: 预言家行动回合
    *  2: 狼人行动回合
    *  3: 女巫行动回合
    *  5: 天亮了，结算夜晚死亡情况以及等待玩家发动技能
    *  6: 投票回合
    *  6.5: 平票pk回合（仅游戏设置了平票pk时）
    *  7: 放逐结果结算回合以及等待玩家发动技能
* day: 游戏进行到第几天
* v1: 座位1（玩家1）
* v2: 座位2（玩家2）
* v3: 座位3（玩家3）
* v4: 座位4（玩家4）
* v5: 座位5（玩家5）
* v6: 座位6（玩家6）
* v7: 座位7（玩家7）
* v8: 座位8（玩家8）
* v9: 座位9（玩家9）
* winner: 胜利阵营(默认-1，未知结果)
    * 0：狼人阵营胜利
    * 1：好人阵营胜利
* mode: 游戏板子
* playerCount: 玩家个数
* witchSaveSelf: （游戏设置）女巫是否能自救
    * 1：全程能自救
    * 2：仅第一晚能自救
    * 3：不能自救
* winCondition: （游戏设置）游戏结束条件
    * 1: 屠边（所有的村民或所有的神职或所有的狼人均死亡则游戏结束）
    * 2: 屠城（所有的狼人或者所有的神职+好人均死亡游戏结束）
* flatTicket: （游戏设置）平票处理
    * 1: 直接进入黑夜，不pk
    * 2: 加赛一轮
* p1: 预言家行动时间
* p2: 狼人团队行动时间
* p3: 女巫行动时间

3、gameTag（server/mongoModel/gameTag.js）
描述：主要记录游戏的关键事件
* roomId: 房间id
* gameId: 游戏id
* day: 游戏进行到第几天
* target: （作用于）目标玩家
* name: （作用于）目标玩家游戏昵称
* position: （作用于）目标玩家座位号
* dayStatus: 游戏昼夜阶段
    * 1: 晚上
    * 2: 白天
* desc: 事件附带描述
    *  assault: 狼人袭击而死
    *  poison: 女巫毒死
    *  shoot: 猎人开枪杀死
    *  boom: 狼人自爆自杀
    *  vote: 被放逐
    *  speakOrder: 发言顺序
* mode: 事件主体
    * 1: 死亡
    * 2: 发言顺序

4、player（server/mongoModel/player.js）
描述：游戏内玩家信息（每局游戏都会生成新的player信息）
* roomId: 所在房间id
* gameId: 所在游戏id
* username: 用户名字
* name: 玩家昵称
* role: 角色key
* roleName: 角色名字
* camp: 阵营
    * 0: 狼人阵营
    * 1: 神民阵营
* campName: 阵营名字
* status: 游戏中存活（出局）状态
* outReason: 出局原因
    * wolf: 被狼人阵营刀死
    * vote: 被投票放逐
    * shoot: 被猎人枪杀
    * poison: 被女巫毒死
* position: 玩家座位号
* skill: 玩家拥有的技能（数组类型，可以多个技能，比如女巫）
    * boom: 自爆
    * check: 查验
    * antidote: 施救
    * poison: 撒毒
    * shoot: 开枪

4、record（server/mongoModel/record.js）
描述：游戏记录（记事本），便于查看游戏进行中的信息，方便复盘。
* roomId: 所在房间id
* gameId: 所在游戏id
* content: 游戏记录描述（富文本，如"天亮了，昨晚是平安夜!"）
* view: 可见玩家（数组类型，当游戏在进行中时，有些信息仅部分玩家可见，比如狼人阵营昨晚刀的谁，仅狼人可见）
* isCommon: 是否是公共信息（比如：发言顺序播报）
* day: 游戏进行到第几天
* stage: 游戏进行到某天的第几阶段
* isTitle: 是否是标题（标题会在信息栏加粗并居中显示）
    * 1: 是
    * 0：不是

5、room（server/mongoModel/room.js）
描述：房间信息描述，
* name: 房间名字
* status: 房间状态
    * 0: 准备中（未开始游戏）
    * 1: 游戏进行中
    * 2: 游戏已结束（复盘中）
* gameId: 游戏id（游戏未开始时为空）
* password: 房间密码
* owner: 房主
* v1: 座位1
* v2: 座位2
* v3: 座位3
* v4: 座位4
* v5: 座位5
* v6: 座位6
* v7: 座位7
* v8: 座位8
* v9: 座位9
* count: 座位数
* wait: 等待区玩家（数组类型）
* ob: 观战玩家（数组类型），观战玩家不参与游戏，但是全程处于上帝视角。

6、room（server/mongoModel/room.js）
描述：玩家视野信息
* roomId: 所在房间id
* gameId: 所在游戏id
* from: 视野拥有者
* to: 视野对象
* status: 视野状态
    * 0: 完全未知（如村民对其他人的视野）
    * 1: 知晓阵营（如预言家查验出神民阵营和狼人阵营，只知道阵营不知道身份）
    * 2: 知晓身份（如狼人知晓狼人同伴）

### 其它
本项目只是单纯的为了学习代码和锻炼逻辑能力的目标而启动的，所以游戏只支持9个人玩，如果需要更多的板子，请在这个基础上自行开发扩展，有问题可联系vx:gy668991
