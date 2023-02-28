import React from "react";
import "./index.styl";

import cls from "classnames";
import predictorIcon from "@assets/images/role/icon/yyj.png"
import witchIcon from "@assets/images/role/icon/nw.png"
import hunterIcon from "@assets/images/role/icon/lr.png"
import villagerIcon from "@assets/images/role/icon/pm.png"
import wolfIcon from "@assets/images/role/icon/langr.png"
import guardIcon from "@assets/images/role/icon/sw.png"

import exileIcon from "@assets/images/exile.svg"
import outIcon from "@assets/images/dead.svg"
import boomIcon from "@assets/images/boom.svg"
import arrow3 from "@assets/images/arrow-green.svg"
import arrow2 from "@assets/images/arrow-red.svg"
import arrow4 from "@assets/images/arrow-blue.svg"
import arrow5 from "@assets/images/arrow-pink.svg"
import arrow6 from "@assets/images/arrow-orange.svg"
import emptyIcon from "@assets/images/empty.svg"

const Record = (props) => {
  const { gameRecord } = props

  const roleIconMap = {
    'villager': villagerIcon,
    'predictor': predictorIcon,
    'wolf': wolfIcon,
    'witch': witchIcon,
    'hunter': hunterIcon,
    'guard': guardIcon,
    'exile': exileIcon,
    'boom': boomIcon,
    'out': outIcon
  }

  const arrowIconMap = {
    2: arrow2,
    3: arrow3,
    4: arrow4,
    5: arrow5,
    6: arrow6
  }

  return (
    <div className="record-view-content-wrap">
      <div className="content-view content-view-scroll">
        {
          gameRecord.map(item=>{
            return (
              <div key={item.key}>
                {
                  (item.content || []).map((record, index)=>{
                    return (
                      <div
                        className={cls({
                          'record-cell': true,
                        })}
                        key={'record' + index}>
                        {
                          record.content.type === 'text' ? (
                            <div className={cls({
                              'cell-title': record.isTitle,
                              'cell-normal': !record.isTitle,
                              'color-red': record.content.level === 2,
                              'color-green': record.content.level === 3,
                              'color-blue': record.content.level === 4,
                              'color-pink': record.content.level === 5,
                              'color-orange': record.content.level === 6,
                            })}>{record.content.text}</div>
                          ) : null
                        }
                        {
                          record.content.type === 'rich-text' ? (
                            <div className="FBH FBAC" style={{flexWrap: 'wrap'}}>
                              {
                                (record.content.content || []).map((itm, index)=>{
                                  return (
                                    <div key={'itd'+ index} className={cls({
                                      'txt': true,
                                      'color-red': itm.level === 2,
                                      'color-green': itm.level === 3,
                                      'color-blue': itm.level === 4,
                                      'color-pink': itm.level === 5,
                                      'color-orange': itm.level === 6,
                                    })}>{itm.text}</div>
                                  )
                                })
                              }
                            </div>
                          ) : null
                        }
                        {
                          record.content.type === 'action' ? (
                            <div className="action-cell FBH FBAC">
                              <div className="from-wrap FBAC FBH">
                                {
                                  record.content.from.role ? (
                                    <img className="icon mar-r5" src={roleIconMap[record.content.from.role]} />
                                  ) : null
                                }
                                {
                                  record.content.from.position ? (
                                    <div className="txt">{record.content.from.position + '号'}</div>
                                  ) : null
                                }
                                {
                                  record.content.from.position ? (
                                    <div className="txt">{'('}</div>
                                  ) : null
                                }
                                {
                                  record.content.from.name ? (
                                    <div className="txt color-main">{record.content.from.name}</div>
                                  ) : null
                                }
                                {
                                  record.content.from.position ? (
                                    <div className="txt">{')'}</div>
                                  ) : null
                                }
                              </div>
                              <div className="action-wrap FBV FBAC FBJE">
                                <img className="arrow" src={arrowIconMap[record.content.level]}/>
                                <div className={cls({
                                  'action-name': true,
                                  'color-red': record.content.level === 2,
                                  'color-green': record.content.level === 3,
                                  'color-blue': record.content.level === 4,
                                  'color-pink': record.content.level === 5,
                                  'color-orange': record.content.level === 6,
                                })}>{record.content.actionName}</div>
                              </div>
                              <div className="to-wrap FBAC FBH FBJC">
                                {
                                  record.content.to.name ? (
                                    <>
                                      {
                                        record.content.to.role ? (
                                          <img className="icon mar-r5" src={roleIconMap[record.content.to.role]} />
                                        ) : null
                                      }
                                      {
                                        record.content.to.position ? (<div className="txt">{record.content.to.position + '号'}</div>) : null
                                      }
                                      {
                                        record.content.to.position ? (<div className="txt">{'('}</div>) : null
                                      }
                                      <div className="txt color-main">{record.content.to.name}</div>
                                      {
                                        record.content.to.position ? (<div className="txt">{')'}</div>) : null
                                      }
                                    </>
                                  ) : (
                                    <img className="icon mar-r5" src={emptyIcon} />
                                  )
                                }
                              </div>
                              {
                                record.content.from.status === 0 ? (
                                  <>
                                    <div className="dead-grey" />
                                    <div className="dead-text FBH FBAC FBJC">
                                      <div className="mar-r40">死</div>
                                      <div className="mar-l40">亡</div>
                                    </div>
                                  </>
                                ) : null
                              }
                            </div>
                          ) : null
                        }
                        {
                          record.content.type === 'vote' ? (
                            <div className="vote-cell FBH FBAC">
                              <div className="from-wrap FBAC FBH">
                                {
                                  record.content.from.role ? (
                                    <img className="icon mar-r5" src={roleIconMap[record.content.from.role]} />
                                  ) : null
                                }
                                {
                                  record.content.from.position ? (
                                    <div className="txt">{record.content.from.position + '号'}</div>
                                  ) : null
                                }
                                {
                                  record.content.from.position ? (
                                    <div className="txt">{'('}</div>
                                  ) : null
                                }
                                {
                                  record.content.from.name ? (
                                    <div className={cls({
                                      'txt': true,
                                      'color-red': record.content.level === 2,
                                      'color-green': record.content.level === 3,
                                      'color-blue': record.content.level === 4,
                                      'color-pink': record.content.level === 5,
                                      'color-orange': record.content.level === 6,
                                    })}>{record.content.from.name}</div>
                                  ) : null
                                }
                                {
                                  record.content.from.position ? (
                                    <div className="txt">{')'}</div>
                                  ) : null
                                }
                              </div>
                              <div className="action-wrap FBH FBAC">
                                <div className={cls({
                                  'action-name mar-r5': true,
                                  'color-red': record.content.level === 2,
                                  'color-green': record.content.level === 3,
                                  'color-blue': record.content.level === 4,
                                  'color-pink': record.content.level === 5,
                                  'color-orange': record.content.level === 6,
                                })}>{record.content.actionName}</div>
                                <img className="arrow" src={arrowIconMap[record.content.level]}/>
                              </div>
                              <div className="to-wrap FBAC FBH FBJC">
                                {
                                  record.content.to.name ? (
                                    <>
                                      <div className={cls({
                                        'txt': true,
                                        'color-red': record.content.level === 2,
                                        'color-green': record.content.level === 3,
                                        'color-blue': record.content.level === 4,
                                        'color-pink': record.content.level === 5,
                                        'color-orange': record.content.level === 6,
                                      })}>{record.content.to.name}</div>
                                    </>
                                  ) : null
                                }
                              </div>
                            </div>
                          ) : null
                        }
                      </div>
                    )
                  })
                }
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
export default Record
