db.lcoco_ui_permission.insertMany([
{
	key: 'system.admin',
	name: '管理员权限',
	status: 1,
	type: 'all',
	remark: '',
	roles: ['admin'],
	createTime: new Date(),
	modifyTime: new Date(),
},
{
	key: 'system.host',
	name: '房主权限',
	status: 1,
	type: 'all',
	remark: '',
	roles: ['host'],
	createTime: new Date(),
	modifyTime: new Date(),
}
])