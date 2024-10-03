import { createContext } from "react";

const boardContext = createContext({
    activeToolItem: '',
    elements: [],
    history: [[]],
    index: Number,
    toolActionType: "",
    boardMouseDownHandler: () => { },
    boardMouseMoveHandler: () => { },
    boardMouseUpHandler: () => { },
    changeToolHandler: () => { },
    textAreaBlurHandler: () => { },
    undoHandler: () => { },
    redoHandler: () => { },
})

export default boardContext