db.lcoco_role.insertMany([
{
	key: 'admin',
	name: '管理员',
	status: 1,
	createTime: new Date(),
	modifyTime: new Date(),
},
{
	key: 'host',
	name: '主办',
	status: 1,
	createTime: new Date(),
	modifyTime: new Date(),
},
{
	key: 'player',
	name: '玩家',
	status: 1,
	createTime: new Date(),
	modifyTime: new Date(),
}
])