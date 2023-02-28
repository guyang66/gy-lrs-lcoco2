import React from "react";
import "./index.styl";
import {Button} from "antd";
import cls from "classnames";
import vote from "@assets/images/role/skill/vote.svg"
import PlayerRoleView from "@components/game/playerRoleInfo";

const Footer = (props) => {
  const { gameDetail, currentRole, playerInfo, actionInfo, skillInfo, useSkill, openRoleCard, timerTime } = props

  return (
    <div className="game-content-wrap">
      {
        gameDetail.isOb ? null : <PlayerRoleView currentRole={currentRole} gameDetail={gameDetail} skillInfo={skillInfo} useSkill={useSkill} onOpen={()=>{openRoleCard()}} />
      }
      <div className="desk-content mar-t10">
        <div className="title-text mar-t5 FBH FBAC FBJC">
          <div className="color-main">{'第' + gameDetail.day + '天'}</div>
          <div className="mar-l5">-</div>
          <div className="color-red mar-l5">{gameDetail.dayTag}</div>
          <div className="mar-l5">-</div>
          <div className="mar-l5 color-orange">{gameDetail.stageName}</div>
          {
            timerTime !== null && timerTime > 0 ? <div className="color-black">行动倒计时：</div> : null
          }
          {
            timerTime !== null && timerTime > 0 ? <div className="color-red">{timerTime}</div> : null
          }
        </div>
        <div className="game-info mar-b10" style={{textAlign: 'center', overflow: 'hidden', position: 'relative', display: 'flex', flexWrap: 'wrap', width: '100%'}}>
          <div className="title-text" style={{fontStyle: 'oblique'}}>
            {
              (gameDetail.broadcast || []).map((item,index)=>{
                return (
                  <span
                    key={item.text + index}
                    className={cls({
                      'color-black': item.level === 1,
                      'color-red': item.level === 2,
                      'color-success': item.level === 3,
                      'color-main': item.level === 4,
                    })}
                  >
                    {item.text}
                  </span>
                )
              })
            }
          </div>
        </div>
        {
          (playerInfo || []).map(item=>{
            return (
              <div key={item.position} className="player-cell mar-5 FBH FBAC FBJC">
                <div
                  className={cls({
                    'bg-light-blue': !item.isSelf,
                    'bg-orange': item.isSelf,
                    'player-seat-cell FBV FBAC FBJC': true,
                  })}>
                  <div className="txt bolder mar-t20">{item.position + '号'}{item.isSelf ? '(我)' : ''}</div>
                  <div className="txt bolder color-main">{item.name}</div>

                  <div className="tag-view">
                    {
                      (item.camp !== null && item.camp !== undefined) ? (
                        <div>
                          {
                            item.camp === 1 ? <div className="tag camp-good bg-green">好人阵营</div> : <div className="tag camp-wolf bg-red">狼人阵营</div>
                          }
                        </div>
                      ) : null
                    }
                    {
                      (item.role !== null && item.role !== undefined) ? (
                        <div className={cls({
                          'tag role-name': true,
                          'bg-black': item.role === 'wolf',
                          'bg-green': item.role === 'villager',
                          'bg-gold': item.role === 'predictor',
                          'bg-purple': item.role === 'witch',
                          'bg-brown': item.role === 'hunter',
                          'bg-pink': item.role === 'guard'
                        })}>{item.roleName}</div>
                      ) : null
                    }
                  </div>

                  <div className="dead-view">
                    {
                      item.status === 0 ? (
                        <>
                          <div className="dead-mask">
                          </div>
                          <div className="dead-text">
                            出局
                          </div>
                        </>
                      ) : null
                    }
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      <div className="mar-t10">
        <div className="bc-title mar-b5 color-red">游戏小贴士</div>
        {
          (gameDetail.systemTip && gameDetail.systemTip.length > 0) ? (
            <div className="notice-content FBV FBJC FBAC">
              <div className="txt mar-t5">
                {
                  (gameDetail.systemTip || []).map((item, index)=>{
                    return (
                      <span
                        key={item.text + index}
                        className={cls({
                          'color-black': item.level === 1,
                          'color-red': item.level === 2,
                          'color-success': item.level === 3,
                          'color-main': item.level === 4,
                        })}
                      >
                        {item.text}
                      </span>
                    )
                  })
                }
              </div>
            </div>
          ) : null
        }
      </div>
      {
        gameDetail.status === 1 ? (
          <div className="mar-t10 FBH FBAC">
            {
              actionInfo.map(item=>{
                return (
                  <div key={item.key} className="FBH FBAC" style={{width: '100%'}}>
                    {
                      item.show ? (
                        <Button
                          onClick={()=>{
                            useSkill(item.key)
                          }}
                          disabled={!item.canUse}
                          className={cls({
                            'skill-btn': true,
                            'btn-primary': item.key === 'vote' && item.canUse,
                            'btn-info': !item.canUse
                          })}>
                          <img className="vote-icon mar-r5" src={vote}/>
                          <span>{item.name}</span>
                        </Button>
                      ) : null
                    }
                  </div>
                )
              })
            }
          </div>
        ) : null
      }
      <div style={{width:'100%', height: '100px'}}/>
    </div>
  )
}

export default Footer
