import { ArrowLength, TOOL_ITEMS } from "../constants";
import rough from 'roughjs/bin/rough'
import { getArrowHeadCoordinates } from "./math";
import getStroke from "perfect-freehand";
import { isPointCloseToLine } from "./math";
const gen = rough.generator()

export const createRoughElement = (id, x1, y1, x2, y2, { type, stroke, fill, size }) => {
    const newElement = {
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        stroke,
        fill,
        size
    }

    const options = {
        seed: id + 1,
        fillStyle: 'solid'
    }
    if (stroke) {
        options.stroke = stroke
    }
    if (stroke) {
        options.fill = fill
    }
    if (size) {
        options.strokeWidth = size
    }

    switch (type) {
        case TOOL_ITEMS.BRUSH: {
            // console.log("hhiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
            const brushElement = {
                id,
                points: [{ x: x1, y: y1 }],
                path: new Path2D(getSvgPathFromStroke(getStroke([{ x: x1, y: y1 }]))),
                type,
                stroke
            }
            return brushElement
        }

        case TOOL_ITEMS.LINE: {
            newElement.roughEle = gen.line(x1, y1, x2, y2, options)
            return newElement
        }

        case TOOL_ITEMS.RECTANGLE: {
            newElement.roughEle = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options)
            return newElement
        }

        case TOOL_ITEMS.CIRCLE: {
            const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2
            const height = y2 - y1, width = (x2 - x1)
            newElement.roughEle = gen.ellipse(cx, cy, width, height, options)
            return newElement
        }

        case TOOL_ITEMS.ARROW: {
            const { x3, y3, x4, y4 } = getArrowHeadCoordinates(x1, y1, x2, y2, ArrowLength)
            newElement.roughEle = gen.linearPath([
                [x1, y1],
                [x2, y2],
                [x3, y3],
                [x2, y2],
                [x4, y4]
            ], options)
            return {
                ...newElement,
                x3: x3,
                y3: y3,
                x4: x4,
                y4: y4
            }
        }

        case TOOL_ITEMS.TEXT: {
            newElement.text = ""
            return newElement
        }
        default:
            throw new Error('type not found')
    }
}

export const getSvgPathFromStroke = (stroke) => {
    if (!stroke.length) return "";

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;

        },
        ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
}


export const isPointNearElement = (element, pointX, pointY) => {
    const { x1, y1, x2, y2, type } = element
    const context = document.getElementById("canvas").getContext("2d")
    switch (type) {
        case TOOL_ITEMS.LINE:
            return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY)

        case TOOL_ITEMS.ARROW:
            const { x3, y3, x4, y4 } = element
            return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY) ||
                isPointCloseToLine(x2, y2, x3, y3, pointX, pointY) ||
                isPointCloseToLine(x2, y2, x4, y4, pointX, pointY)

        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
            return isPointCloseToLine(x1, y1, x1, y2, pointX, pointY) ||
                isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
                isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
                isPointCloseToLine(x1, y2, x2, y2, pointX, pointY)
        case TOOL_ITEMS.BRUSH:
            return context.isPointInPath(element.path, pointX, pointY)
        case TOOL_ITEMS.TEXT:
            context.font = `${element.size}px Caveat`;
            context.fillStyle = element.stroke
            const textWidth = context.measureText(element.text).width
            const textHeight = parseInt(element.size);
            context.restore()
            return (
                isPointCloseToLine(x1, y1, x1 + textWidth, y1, pointX, pointY) ||
                isPointCloseToLine(
                    x1 + textWidth,
                    y1,
                    x1 + textWidth,
                    y1 + textHeight,
                    pointX,
                    pointY
                ) ||
                isPointCloseToLine(
                    x1 + textWidth,
                    y1 + textHeight,
                    x1,
                    y1 + textHeight,
                    pointX,
                    pointY
                ) ||
                isPointCloseToLine(x1, y1 + textHeight, x1, y1, pointX, pointY)
            )
        default:
            throw new Error("Type not found")
    }
}