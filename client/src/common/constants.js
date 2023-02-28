import predictor from "@assets/images/role/card/yuyanjia.png"
import hunter from "@assets/images/role/card/lieren.png"
import witch from "@assets/images/role/card/nvwu.png"
import villager from "@assets/images/role/card/pingming.png"
import wolf from "@assets/images/role/card/langren.png"
import guard from "@assets/images/role/card/shouwei.png"

const roleCardMap = {
  'predictor': predictor,
  'hunter': hunter,
  'witch': witch,
  'villager': villager,
  'wolf': wolf,
  'guard': guard
}

const modalDescMap = {
  'check': {
    title: '查验一位玩家',
    className: 'btn-primary',
    buttonText: '查验他',
    resultTitle: '查验结果',
    confirm: '确定要查验该玩家吗？'
  },
  'assault': {
    title: '袭击一位玩家',
    className: 'btn-folk',
    buttonText: '袭击他',
    resultTitle: '袭击结果',
    resultDesc: '你袭击了',
    confirm: '确定要袭击该玩家吗？'
  },
  'poison': {
    title: '使用毒药',
    className: 'btn-error',
    buttonText: '撒毒',
    resultTitle: '撒毒结果',
    resultDesc: '你毒死了',
    confirm: '确定对该玩家使用毒药吗？'
  },
  'shoot': {
    title: '开枪带走一位玩家',
    className: 'btn-warning',
    buttonText: '开枪',
    resultTitle: '开枪结果',
    resultDesc: '你开枪带走了',
    confirm: '确定要开枪带走该玩家吗？'
  },
  'vote': {
    title: '投票放逐一位玩家',
    className: 'btn-primary',
    buttonText: '投票',
    resultTitle: '投票结果',
    resultDesc: '你投票放逐了',
    confirm: '确定投票放逐该玩家吗？'
  },
  'defend': {
    title: '选择守护一位玩家',
    className: 'btn-primary',
    buttonText: '守护',
    resultTitle: '守护结果',
    resultDesc: '你守护了',
    confirm: '确定守护该玩家吗？'
  },
  'antidote': {
    confirm: '确定要使用解药救下该玩家吗？',
  },
  'boom': {
    confirm: '确定要自爆吗（自爆之后直接进入天黑）？',
  }
}

const roleMap = {
  'predictor': '预言家',
  'witch': '女巫',
  'hunter': '猎人',
  'wolf': '狼人',
  'villager': '村民'
}

export default {
  roleMap,
  roleCardMap,
  modalDescMap,
}
