import React from "react";
import "./index.styl";
import predictor from "@assets/images/role/icon/yyj.png"
import witch from "@assets/images/role/icon/nw.png"
import hunter from "@assets/images/role/icon/lr.png"
import villager from "@assets/images/role/icon/pm.png"
import wolf from "@assets/images/role/icon/langr.png"
import guard from "@assets/images/role/icon/sw.png"

import check from "@assets/images/role/skill/check.svg"
import antidote from "@assets/images/role/skill/antidote.svg"
import boom from "@assets/images/role/skill/boom.svg"
import poison from "@assets/images/role/skill/poison.svg"
import shoot from "@assets/images/role/skill/shoot.svg"
import assault from "@assets/images/role/skill/assault.svg"
import defend from "@assets/images/role/skill/defend.svg"

import {Button} from "antd";

import cls from "classnames";

const RoleView = (props) => {
  const { gameDetail, skillInfo, currentRole, useSkill, onOpen } = props
  const roleImgMap = {
    'villager': villager,
    'predictor': predictor,
    'wolf': wolf,
    'witch': witch,
    'hunter': hunter,
    'guard': guard,
  }

  const skillImgMap = {
    check: check,
    antidote: antidote,
    boom: boom,
    poison: poison,
    shoot: shoot,
    assault: assault,
    defend: defend
  }
  return (
    <div className="player-role-info-wrap FBH FBAC">
      <div className="FBH">
        <div style={{display: 'inline-block', position: 'relative'}}>
          <img className="icon mar-r10"
               onClick={onOpen}
               src={roleImgMap[currentRole.role]} />
          {
            currentRole.status === 0 && gameDetail.status === 1 ? (
              <>
                <div className="dead-mask" />
                <div className="dead-text">死 亡</div>
              </>
            ) : null
          }
        </div>
        <div className="FBV FBJC">
          <div className="username normal-text mar-l50 color-main" >{currentRole.name}</div>
          <div>
            <span className={cls({
              'color-red': currentRole.role === 'wolf',
              'color-green': currentRole.role === 'villager',
              'color-gold': currentRole.role === 'predictor',
              'color-purple': currentRole.role === 'witch',
              'color-brown': currentRole.role === 'hunter',
              'color-pink': currentRole.role === 'guard',
              'normal-text': true
            })}>{currentRole.roleName}</span>
            <span className={cls({
              'color-green': currentRole.camp === 1,
              'color-red': currentRole.camp === 0,
              'normal-text': true
            })}>{currentRole.camp === 1 ? '（好人阵营）' : '（狼人阵营）'}</span>
          </div>
        </div>
      </div>
      <div className="skills-wrap mar-l40">
        {
          gameDetail.status === 1 ? (
            <div className="FBH FBAC">
              <div className="skills-content mar-r20 FBH FBAC">
                {
                  skillInfo.map(item=>{
                    return (
                      <div key={item.key}>
                        {
                          item.show ? (
                            <Button
                              onClick={()=>{
                                useSkill(item.key)
                              }}
                              disabled={!item.canUse}
                              className={cls({
                                'skills-btn mar-l10 mar-r10': true,
                                'btn-error': item.key === 'assault' && item.canUse,
                                'btn-delete': item.key === 'boom' && item.canUse,
                                'btn-primary': (item.key === 'check' || item.key === 'defend') && item.canUse,
                                'btn-success': item.key === 'antidote' && item.canUse,
                                'btn-folk': item.key === 'poison' && item.canUse,
                                'btn-warning': item.key === 'shoot' && item.canUse,
                                'btn-info': !item.canUse
                              })}>
                              <img src={skillImgMap[item.key]}/>
                              <div className="skill-name">{item.name}</div>
                            </Button>
                          ) : null
                        }
                      </div>
                    )
                  })
                }
              </div>
            </div>
          ) : null
        }
      </div>
    </div>
  )
}
export default RoleView
