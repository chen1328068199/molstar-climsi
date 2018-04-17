/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Vec3 } from 'mol-math/linear-algebra'
import InputObserver from 'mol-util/input/input-observer'
import Renderer from 'mol-gl/renderer'
import { RenderObject } from 'mol-gl/scene'

import TrackballControls from './controls/trackball'
import { Viewport } from './camera/util'
import { PerspectiveCamera } from './camera/perspective'
import { resizeCanvas } from './util';

interface Viewer {
    add: (o: RenderObject) => void
    remove: (o: RenderObject) => void
    clear: () => void
    draw: () => void

    requestDraw: () => void
    animate: () => void

    handleResize: () => void

    dispose: () => void
}

namespace Viewer {
    export function create(canvas: HTMLCanvasElement, container: Element): Viewer {
        const input = InputObserver.create(canvas)
        input.resize.subscribe(handleResize)

        const camera = PerspectiveCamera.create({
            near: 0.01,
            far: 10000,
            position: Vec3.create(0, 0, 50)
        })

        const controls = TrackballControls.create(input, camera, {

        })

        const renderer = Renderer.create(canvas, camera)

        let drawPending = false

        function draw () {

            controls.update()
            camera.update()
            renderer.draw()
        }

        function requestDraw () {
            if (drawPending) return
            drawPending = true
            window.requestAnimationFrame(draw)
        }

        function animate () {
            draw()
            window.requestAnimationFrame(animate)
        }

        handleResize()

        return {
            add: (o: RenderObject) => {
                renderer.add(o)
            },
            remove: (o: RenderObject) => {
                renderer.remove(o)
            },
            clear: () => {
                renderer.clear()
            },

            draw,
            requestDraw,
            animate,

            handleResize,

            dispose: () => {
                input.dispose()
                controls.dispose()
                renderer.dispose()
            }
        }

        function handleResize() {
            resizeCanvas(canvas, container)
            const viewport = { x: 0, y: 0, width: canvas.width, height: canvas.height }
            renderer.setViewport(viewport)
            Viewport.copy(camera.viewport, viewport)
            Viewport.copy(controls.viewport, viewport)
        }
    }
}

export default Viewer