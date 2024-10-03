import React, { useReducer } from 'react'
import boardContext from './boardContext'
import { TOOL_ITEMS, BOARD_ACTIONS, TOOL_ACTION_TYPES } from '../constants'
import { createRoughElement } from '../utils/elements'
import getStroke from 'perfect-freehand'
import { getSvgPathFromStroke, isPointNearElement } from '../utils/elements'


const boardReducer = (state, action) => {
    switch (action.type) {
        case "CHANGE_TOOL": {
            return {
                ...state,
                activeToolItem: action.payload.tool
            }
        }
        case BOARD_ACTIONS.CHANGE_TOOL_ACTION: {
            return {
                ...state,
                toolActionType: action.payload.actionType
            }
        }
        case "DRAW_DOWN": {
            const { clientX, clientY } = action.payload
            const newElement = createRoughElement(
                state.elements.length,
                clientX,
                clientY,
                clientX,
                clientY,
                {
                    type: state.activeToolItem,
                    stroke: action.payload.stroke,
                    fill: action.payload.fill,
                    size: action.payload.size
                }
            )
            const prevElements = state.elements
            return {
                ...state,
                elements: [...prevElements, newElement],
                toolActionType: state.activeToolItem === TOOL_ITEMS.TEXT ?
                    TOOL_ACTION_TYPES.WRITING :
                    TOOL_ACTION_TYPES.DRAWING
            }
        }

        case "DRAW_MOVE": {
            const { clientX, clientY } = action.payload
            const newElements = [...state.elements]
            const index = newElements.length - 1
            const { type } = newElements[index]
            switch (type) {
                case TOOL_ITEMS.LINE:
                case TOOL_ITEMS.RECTANGLE:
                case TOOL_ITEMS.CIRCLE:
                case TOOL_ITEMS.ARROW:
                    const { x1, y1, stroke, fill, size } = newElements[index]
                    const newElement = createRoughElement(
                        index,
                        x1,
                        y1,
                        clientX,
                        clientY,
                        {
                            type: state.activeToolItem,
                            stroke,
                            fill,
                            size
                        }
                    )
                    newElements[index] = newElement
                    return {
                        ...state,
                        elements: newElements
                    }
                case TOOL_ITEMS.BRUSH: {
                    newElements[index].points = [...newElements[index].points, { x: clientX, y: clientY }];
                    newElements[index].path = new Path2D(
                        getSvgPathFromStroke(getStroke(newElements[index].points))
                    );
                    return {
                        ...state,
                        elements: newElements,
                    }
                }

                default: {
                    throw new Error('Type not Found')
                }
            }
        }

        case BOARD_ACTIONS.ERASE: {
            const { clientX, clientY } = action.payload;
            let newElements = [...state.elements];
            newElements = newElements.filter((element) => {
                return !isPointNearElement(element, clientX, clientY);
            })

            if (newElements.length === state.elements.length) {
                return {
                    ...state,
                    elements: newElements,
                }
            }

            let newHistory = state.history.slice(0, state.index + 1)
            newHistory.push(newElements)

            return {
                ...state,
                elements: newElements,
                history: newHistory,
                index: state.index + 1
            }
        }

        case BOARD_ACTIONS.CHANGE_TEXT: {
            const index = state.elements.length - 1;
            let newElements = [...state.elements]
            newElements[index].text = action.payload.text
            let newHistory = state.history.slice(0, state.index + 1)
            newHistory.push(newElements)
            return {
                ...state,
                toolActionType: TOOL_ACTION_TYPES.NONE,
                elements: newElements,
                history: newHistory,
                index: state.index + 1
            }
        }

        case BOARD_ACTIONS.DRAW_UP: {
            let newHistory = state.history.slice(0, state.index + 1)
            newHistory.push(state.elements)
            return {
                ...state,
                history: newHistory,
                index: state.index + 1
            }
        }

        case BOARD_ACTIONS.UNDO: {
            if (state.index <= 0) {
                return { ...state }
            }
            return {
                ...state,
                elements: state.history[state.index - 1],
                index: state.index - 1
            }
        }

        case BOARD_ACTIONS.REDO: {
            if (state.index >= state.history.length - 1) {
                return { ...state }
            }
            return {
                ...state,
                elements: state.history[state.index + 1],
                index: state.index + 1
            }
        }

        default:
            return state;
    }
}

const initialBoardState = {
    activeToolItem: TOOL_ITEMS.LINE,
    elements: [],
    history: [[]],
    index: 0,
    toolActionType: TOOL_ACTION_TYPES.NONE
}

const BoardProvider = ({ children }) => {
    const [boardState, dispatchBoardAction] = useReducer(boardReducer, initialBoardState)
    // const [activeToolItem, setActiveToolItem] = useState(TOOL_ITEMS.LINE)
    // cosnt[elements, setElements] = useState([])

    const changeToolHandler = (tool) => {
        dispatchBoardAction({
            type: BOARD_ACTIONS.CHANGE_TOOL,
            payload: {
                tool,
            }
        })
    }

    const boardMouseDownHandler = (event, toolboxState) => {
        if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) { return }

        const { clientX, clientY } = event

        if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
            dispatchBoardAction({
                type: BOARD_ACTIONS.CHANGE_TOOL_ACTION,
                payload: {
                    actionType: TOOL_ACTION_TYPES.ERASING
                }
            })
        }
        else {
            dispatchBoardAction({
                type: BOARD_ACTIONS.DRAW_DOWN,
                payload: {
                    clientX,
                    clientY,
                    stroke: toolboxState[boardState.activeToolItem]?.stroke,
                    fill: toolboxState[boardState.activeToolItem]?.fill,
                    size: toolboxState[boardState.activeToolItem]?.size

                }
            })
        }




    }

    const boardMouseMoveHandler = (event) => {
        if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) { return }
        const { clientX, clientY } = event
        if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
            dispatchBoardAction({
                type: BOARD_ACTIONS.ERASE,
                payload: {
                    clientX,
                    clientY
                }
            })
            return
        }
        if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
            dispatchBoardAction({
                type: BOARD_ACTIONS.DRAW_MOVE,
                payload: {
                    clientX,
                    clientY
                }
            })
        }

    }

    const boardMouseUpHandler = () => {
        if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) { return }
        if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
            dispatchBoardAction({
                type: BOARD_ACTIONS.DRAW_UP
            })
        }
        dispatchBoardAction({
            type: BOARD_ACTIONS.CHANGE_TOOL_ACTION,
            payload: {
                actionType: TOOL_ACTION_TYPES.NONE
            }
        })
    }

    const textAreaBlurHandler = (text) => {
        dispatchBoardAction({
            type: BOARD_ACTIONS.CHANGE_TEXT,
            payload: {
                text
            }
        })
    }

    const undoHandler = () => {
        dispatchBoardAction({
            type: BOARD_ACTIONS.UNDO
        })
    }

    const redoHandler = () => {
        dispatchBoardAction({
            type: BOARD_ACTIONS.REDO
        })
    }




    const boardContextValue = {
        activeToolItem: boardState.activeToolItem,
        elements: boardState.elements,
        toolActionType: boardState.toolActionType,
        history: boardState.history,
        index: boardState.index,
        changeToolHandler,
        boardMouseDownHandler,
        boardMouseMoveHandler,
        boardMouseUpHandler,
        textAreaBlurHandler,
        undoHandler,
        redoHandler
    }
    return (
        <boardContext.Provider value={boardContextValue}
        >
            {children}
        </boardContext.Provider>
    )
}

export default BoardProvider