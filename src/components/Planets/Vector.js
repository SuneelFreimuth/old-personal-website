// Keep in mind that functions we curry with lodash can still be
// called with multiple arguments like func(1,2,3), or even like
// func(1,2)(3).
import curry from 'lodash/curry'
import has from 'lodash/has'

export const Orientations = {
	CLOCKWISE: 1,
	COUNTERCLOCKWISE: -1
}

export function vector(x, y) {
    return {x,y}
}
export function isVector(obj) {
	return has(obj, 'x') && has(obj, 'y')
}
export function toString(v) {
    return `<${v.x}, ${v.y}>`
}
export const equal = curry((v0, v1) => {
    return v0.x === v1.x && v0.y === v1.y
})
export function clone(v) {
    return {x: v.x, y: v.y}
}
export const add = curry((v0, v1) => {
    return { x: v0.x + v1.x, y: v0.y + v1.y }
})
export const sub = curry((v0, v1) => {
    return { x: v0.x - v1.x, y: v0.y - v1.y }
})
export const mult = curry((c, v) => {
    return { x: c*v.x, y: c*v.y }
})
export const compMult = curry((v0, v1) => {
    return { x: v0.x*v1.x, y: v0.y*v1.y }
})
export const div = curry((c, v) => {
    return {x: v.x/c, y: v.y/c}
})
export function sum(vectorArray) {
    return vectorArray.reduce((sum_, v) => add(sum_, v))
}
export const dot = curry((v0, v1) => {
    return v0.x*v1.x + v0.y*v1.y
})
export const mag = curry(v => {
    return Math.sqrt(v.x * v.x + v.y * v.y)
});
export function magSq(v) {
	return v.x*v.x + v.y*v.y
}
export const limit = curry((c, v) => {
    return mag(v) > c ? mult(c, norm(v)) : v
});
export function norm(v) {
    const m = mag(v)
    return mult(m === 0 ? 1 : 1/m, v)
}
export function heading(v) {
    return Math.atan2(v.y, v.x) + Math.PI
}
// For reference on the wonderful math behind rotation: https://en.wikipedia.org/wiki/Rotation_matrix
export const rotate = curry((angle, v) => {
    return {
        x: v.x*Math.cos(angle) - v.y*Math.sin(angle),
        y: v.x*Math.sin(angle) + v.y*Math.cos(angle)
    }
})
export const midpoint = curry((v0, v1) => {
	return mult(0.5, add(v0, v1))
})
export const dist = (v0, v1) => {
    return Math.sqrt(
        Math.pow(v1.x - v0.x, 2) +
        Math.pow(v1.y - v0.y, 2)
    )
}
export const half = mult(0.5)
export const rotateAround = curry((rotOrigin, angle, v) => {
	return add(rotOrigin, rotate(angle, sub(v, rotOrigin)))
})
export const reflectAcrossNormal = curry((v, normal) => {
	return sub(v, mult(2 * dot(v,normal) * magSq(normal), normal))
})
export function fromAngle(angle) {
    return { x: Math.cos(angle), y: Math.sin(angle) }
}
export function angleBetween(v0, v1) {
    return Math.atan2(v0.y, v0.x) - Math.atan2(v1.y, v1.x)
}
export const apply = curry((f, v) => {
    return {x: f(v.x), y: f(v.y)}
})
// Is v1 in the clockwise or counterclockwise direction to v0?
// Judged with respect to graphics space (+x is right, +y is down.)
export const relativeOrientation = curry((v0, v1) => {
	return Math.sign(-v0.y*v1.x + v0.x*v1.y)
})
