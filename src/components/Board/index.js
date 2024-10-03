import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import rough from 'roughjs'
import boardContext from "../../store/boardContext";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolboxContext";
import classes from './index.module.css'

function Board() {
    const canvasRef = useRef()
    const { elements, boardMouseDownHandler, boardMouseMoveHandler, boardMouseUpHandler, toolActionType, textAreaBlurHandler } = useContext(boardContext)

    const { toolboxState } = useContext(toolboxContext)

    const textAreaRef = useRef()

    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

    }, [])

    useLayoutEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        context.save()

        const roughCanvas = rough.canvas(canvas)

        elements.forEach((element) => {
            switch (element.type) {
                case TOOL_ITEMS.LINE:
                case TOOL_ITEMS.RECTANGLE:
                case TOOL_ITEMS.CIRCLE:
                case TOOL_ITEMS.ARROW:
                    roughCanvas.draw(element.roughEle)
                    break
                case TOOL_ITEMS.BRUSH:
                    context.fillStyle = element.stroke;
                    context.fill(element.path);
                    context.restore();
                    break
                case TOOL_ITEMS.TEXT:
                    context.textBaseLine = 'top'
                    context.font = `${element.size}px Caveat`
                    context.fillStyle = element.stroke
                    context.fillText(element.text, element.x1, element.y1 + 20)
                    context.restore()
                    break
                default:
                    throw new Error("Type not Recognized")
            }

        })

        return () => {
            context.clearRect(0, 0, canvas.width, canvas.height)
        }
    }, [elements])

    useEffect(() => {
        const textArea = textAreaRef.current

        if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
            setTimeout(() => {
                textArea.focus()
            }, 0)
        }
    }, [toolActionType])

    const handleMouseDown = (event) => {
        boardMouseDownHandler(event, toolboxState)
    }

    const handleMouseMove = (event) => {
        // if (toolActionType === TOOL_ACTION_TYPES.DRAWING || toolActionType === TOOL_ACTION_TYPES.ERASING) {
        boardMouseMoveHandler(event)
        // }
    }

    const handleMouseUp = () => {
        boardMouseUpHandler()
    }

    return (
        <>
            {toolActionType === TOOL_ACTION_TYPES.WRITING && <textarea
                ref={textAreaRef}
                type='text'
                className={classes.textElementBox}
                style={{
                    top: elements[elements.length - 1].y1,
                    left: elements[elements.length - 1].x1,
                    fontSize: `${elements[elements.length - 1]?.size}px`,
                    color: elements[elements.length - 1]?.stroke
                }}
                onBlur={(e) => { textAreaBlurHandler(e.target.value) }}
            />}
            <canvas ref={canvasRef}
                id="canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            ></canvas>
        </>

    );
}

export default Board;
