import React, { useContext } from 'react'
import classes from './index.module.css'
import cx from 'classnames'
import { FaSlash, FaFont, FaRegCircle, FaArrowRight, FaPaintBrush, FaEraser, FaUndoAlt, FaRedoAlt } from 'react-icons/fa'
import { LuRectangleHorizontal } from 'react-icons/lu'
import boardContext from '../../store/boardContext'

const ToolBar = () => {

    const { activeToolItem, changeToolHandler, undoHandler, redoHandler } = useContext(boardContext)

    return (
        <div className={classes.container}>
            <div
                className={
                    cx(classes.toolItem, { [classes.active]: activeToolItem === "BRUSH" })
                }
                onClick={() => changeToolHandler("BRUSH")}
            >
                <FaPaintBrush />
            </div>

            <div
                className={
                    cx(classes.toolItem, { [classes.active]: activeToolItem === "LINE" })
                }
                onClick={() => changeToolHandler("LINE")}
            >
                <FaSlash />
            </div>
            <div
                className={
                    cx(classes.toolItem, { [classes.active]: activeToolItem === "RECTANGLE" })
                }
                onClick={() => changeToolHandler("RECTANGLE")}
            >
                <LuRectangleHorizontal />
            </div>

            <div
                className={
                    cx(classes.toolItem, { [classes.active]: activeToolItem === "CIRCLE" })
                }
                onClick={() => changeToolHandler("CIRCLE")}
            >
                <FaRegCircle />
            </div>

            <div
                className={
                    cx(classes.toolItem, { [classes.active]: activeToolItem === "ARROW" })
                }
                onClick={() => changeToolHandler("ARROW")}
            >
                <FaArrowRight />
            </div>

            <div
                className={
                    cx(classes.toolItem, { [classes.active]: activeToolItem === "ERASER" })
                }
                onClick={() => changeToolHandler("ERASER")}
            >
                <FaEraser />
            </div>

            <div
                className={
                    cx(classes.toolItem, { [classes.active]: activeToolItem === "TEXT" })
                }
                onClick={() => changeToolHandler("TEXT")}
            >
                <FaFont />
            </div>

            <div
                className={classes.toolItem}
                onClick={undoHandler}
            >
                <FaUndoAlt />
            </div>

            <div
                className={classes.toolItem}
                onClick={redoHandler}
            >
                <FaRedoAlt />
            </div>

        </div>
    )
}

export default ToolBar