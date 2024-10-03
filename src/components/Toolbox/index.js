import React, { useContext } from 'react'
import classes from './index.module.css'
import cx from 'classnames'
import { COLORS, FILL_TOOL_TYPE, STROKE_TOOL_TYPE, SIZE_TOOL_TYPE, TOOL_ITEMS } from '../../constants'
import boardContext from '../../store/boardContext'
import toolboxContext from '../../store/toolboxContext'
const Toolbox = () => {
    const { activeToolItem } = useContext(boardContext)
    const { toolboxState, changeStrokeHandler, changeFillHandler, changeSizeHandler } = useContext(toolboxContext)

    const strokeColor = toolboxState[activeToolItem]?.stroke
    const fillColor = toolboxState[activeToolItem]?.fill
    const size = toolboxState[activeToolItem]?.size

    return (
        <div className={classes.container}>
            {STROKE_TOOL_TYPE.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
                <div className={classes.toolBoxLabel}>Stroke Color</div>
                <div className={classes.colorsContainer}>
                    {Object.keys(COLORS).map((k) => {
                        return (
                            <div
                                className={cx(classes.colorBox, {
                                    [classes.activeColorBox]: strokeColor === COLORS[k]
                                })}
                                style={{ backgroundColor: COLORS[k] }}
                                onClick={() => changeStrokeHandler(activeToolItem, COLORS[k])}
                            ></div>
                        )
                    })}

                </div>
            </div>}

            {FILL_TOOL_TYPE.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
                <div className={classes.toolBoxLabel}>Fill Color</div>
                <div className={classes.colorsContainer}>
                    {Object.keys(COLORS).map((k) => {
                        return (
                            <div
                                className={cx(classes.colorBox, {
                                    [classes.activeColorBox]: fillColor === COLORS[k]
                                })}
                                style={{ backgroundColor: COLORS[k] }}
                                onClick={() => changeFillHandler(activeToolItem, COLORS[k])}
                            ></div>
                        )
                    })}

                </div>
            </div>}

            {SIZE_TOOL_TYPE.includes(activeToolItem) && <div className={classes.selectOptionContainer}>
                <div className={classes.toolBoxLabel}>{activeToolItem === TOOL_ITEMS.TEXT ? " Font Size" :
                    "Brush Size"}</div>
                <input
                    type="range"
                    min={activeToolItem === TOOL_ITEMS.TEXT ? 16 : 1}
                    max={activeToolItem === TOOL_ITEMS.TEXT ? 30 : 10}
                    step={1}
                    value={size}
                    onChange={(e) => { changeSizeHandler(activeToolItem, e.target.value) }}
                >
                </input>
            </div>}


        </div >
    )
}

export default Toolbox