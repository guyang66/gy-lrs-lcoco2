db.lcoco_user.insertMany([
{
	username: 'lrs',
	password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', // 密码是1
	name: '狼人杀管理员',
	roles: ['admin'],
	defaultRole: 'admin',
	defaultRoleName: '管理员',
	noModify: 1,
	status: 1,
	remark: '管理员只负责创建玩家、不能参与游戏！'
},
{
	username: 'host',
	password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', // 密码是1
	name: '房主',
	roles: ['host'],
	defaultRole: 'host',
	defaultRoleName: '房主',
	noModify: 1,
	status: 1,
	remark: '房主可创建房间，作为主持人，同时参与游戏'
},
{
	username: 'player',
	password: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', // 密码是1
	name: '玩家1',
	roles: ['player'],
	defaultRole: 'player',
	defaultRoleName: '玩家',
	noModify: 1,
	status: 1,
	remark: '普通玩家'
}
])