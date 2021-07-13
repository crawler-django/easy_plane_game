import React, { useEffect, useMemo, useRef } from 'react'
import './App.css'

// canvas宽高
const C_WIDTH = 400
const C_HEIGHT = 400

// 主角飞机属性
const speed = 4 // 速度
const PLANE_WIDTH = 30 // 飞机宽度
const PLANE_HEIGHT = 36 // 飞机高度

// 敌机1属性
const ENEMY1_WIDTH = 30 // 敌机1宽度
const ENEMY1_HEIGHT = 36 // 敌机1高度
const ENEMY1_BLOOD = 3 // 敌机1血条

const ENEMY_SPEED = 1 // 敌机速度

const RANDOM_ENEMY = 10 // 随机敌机数量

// 子弹
const BULLET_SPEED = -5 // 子弹速度
const BULLET_GAP = 3 // 子弹生成间隔
const BULLET_WIDTH = 3 // 子弹宽度
const BULLET_HEIGHT = 5 //字段高度

// 爆炸
const MAX_BOOM_INDEX = 14
const BOOM_SIZE = 64

// 血条
const BLOOD_BAR_SIZE = 3
const BLOOD_PADDING = 5

interface ISpite {
  x: number,
  y: number,
  width: number,
  height: number,
  isOver: boolean,
  boomIndex: number,
  ifDel: boolean,
  hp: number
}

// 随机出生位置
const randomStartXY = () => {
  return {
    x: Math.floor((C_WIDTH - ENEMY1_WIDTH) * Math.random()),
    y: -Math.floor(200 * Math.random()),
    isOver: false,
    width: ENEMY1_WIDTH,
    height: ENEMY1_HEIGHT,
    boomIndex: 0,
    ifDel: false,
    hp: ENEMY1_BLOOD,
  }
}

const generateEnemy = (num: number) => {
  let arr = []

  for (let i = 0; i < num; i++) {
    arr.push({
      ...randomStartXY()
    })
  }

  return arr
}

function App() {

  let bulletGapNum = 0

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const directionFlagRef = useRef({ isLeft: false, isTop: false, isRight: false, isBottom: false })

  // 主角飞机位置属性
  const xyObj = useRef({ x: 0, y: 0, width: PLANE_WIDTH, height: PLANE_HEIGHT, boomIndex: 0, isOver: false, ifDel: false, hp: 0 })

  // 敌机飞机位置属性
  // const enemysObj = useRef(generateEnemy())
  // 子弹数组
  let bulletArr: ISpite[] = []
  // 敌机数组
  const enemysArr: ISpite[] = generateEnemy(10)

  const getCtx = () => {
    const canvasNode = canvasRef?.current
    const ctx = canvasNode?.getContext('2d')

    return ctx
  }

  const getXY = () => {
    return xyObj?.current
  }

  // 主角飞机
  const plane = useMemo(() => {
    const imgObj = new Image()
    imgObj.src = '../assets/plane.png'
    return imgObj
  }, [])

  // 背景图
  const background = useMemo(() => {
    const imgObj = new Image()
    imgObj.src = '../assets/background.png'
    return imgObj
  }, [])

  // 敌机1
  const enemy1 = useMemo(() => {
    const imgObj = new Image()
    imgObj.src = '../assets/enemy.png'
    return imgObj
  }, [])

  // 子弹
  const bullet = useMemo(() => {
    const imgObj = new Image()
    imgObj.src = '../assets/bullet.png'
    return imgObj
  }, [])

  // 爆炸
  const boom = useMemo(() => {
    const imgObj = new Image()
    imgObj.src = '../assets/boom.png'
    return imgObj
  }, [])

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {

    ctx?.clearRect(0, 0, C_WIDTH, C_HEIGHT)
  }

  const ifCollision = (a: ISpite, b: ISpite) => {
    const aLeft = a.x, aRight = a.x + a.width, aTop = a.y, aBottom = a.y + a.height
    const bLeft = b.x, bRight = b.x + b.width, bTop = b.y, bBottom = b.y + b.height

    if (aRight < bLeft || aLeft > bRight || aTop > bBottom || aBottom < bTop) {
      return false
    } else {
      return true
    }
  }

  const drawEnemyBloodBar = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, rate: number) => {
    // 底色
    ctx.beginPath()
    ctx.lineWidth = BLOOD_BAR_SIZE
    ctx.strokeStyle = 'white'
    ctx.lineTo(x, y - BLOOD_PADDING)
    ctx.lineTo(x + width, y - BLOOD_PADDING)
    ctx.stroke()
    ctx.closePath()

    // 血条色
    ctx.beginPath()
    ctx.lineWidth = BLOOD_BAR_SIZE
    ctx.strokeStyle = 'green'
    ctx.lineTo(x, y - BLOOD_PADDING)
    ctx.lineTo((x + width * rate), y - BLOOD_PADDING)
    ctx.stroke()
    ctx.closePath()
  }
  
  const generateAndMoveEnemys = () => {

    if (enemysArr.length < 10) {
      const num = 10 - enemysArr.length

      enemysArr.push(...generateEnemy(num))
    }

    enemysArr.forEach((item) => {
      item.y = item?.y + ENEMY_SPEED

      if (item.y > C_HEIGHT + item.height) {
        item.ifDel = true
        item.isOver = true
      }
    })
  }

  const drawEnemy = (ctx: CanvasRenderingContext2D) => {

    generateAndMoveEnemys()

    const majorPlane = getXY()

    for (let i = 0; i < enemysArr?.length; i++) {

      const enemy = enemysArr[i]

      for (let j = 0; j < bulletArr?.length; j++) {
        const bullet = bulletArr[j] 

        if ((!enemy?.isOver) && (!bullet?.isOver) && ifCollision(bullet, enemy)) {
          enemy.hp = enemy.hp - 1
          bullet.isOver = true

          if (enemy.hp <= 0) {
            enemy.isOver = true
          }
        } 
      }

      if ((!enemy?.isOver) && ifCollision(majorPlane, enemy)) {
        enemy.isOver = true
      }
      
      if (enemy?.isOver) {

        if (enemy?.ifDel) {
          enemysArr.splice(i, 1)
          i--
          continue
        } else {
         
          ctx.drawImage(boom, enemy?.boomIndex * BOOM_SIZE, 0, BOOM_SIZE, BOOM_SIZE, enemy?.x, enemy?.y, enemy?.width, enemy?.height)
          enemy.boomIndex = enemy.boomIndex + 1
          if (enemy.boomIndex >= MAX_BOOM_INDEX) {
            enemy.ifDel = true
          }
        }

      } else {
        drawEnemyBloodBar(ctx, enemy?.x, enemy?.y, enemy?.width, enemy?.hp / ENEMY1_BLOOD)
        ctx.drawImage(enemy1, enemy?.x, enemy?.y, enemy?.width, enemy?.height)
      }
    }
  }

  const drawMajorPlane = (ctx: CanvasRenderingContext2D) => {
    const { isLeft, isTop, isRight, isBottom } = directionFlagRef.current
    const tempXYCurrent = xyObj?.current

    if (isLeft) {
      tempXYCurrent.x = tempXYCurrent.x - speed
      if (tempXYCurrent.x < 0) {
        tempXYCurrent.x = 0
      }
    }
    if (isTop) {
      tempXYCurrent.y = tempXYCurrent.y - speed
      if (tempXYCurrent.y < 0) {
        tempXYCurrent.y = 0
      }
    }
    if (isRight) {
      tempXYCurrent.x = tempXYCurrent.x + speed
      if (tempXYCurrent.x > C_WIDTH - PLANE_WIDTH) {
        tempXYCurrent.x = C_WIDTH - PLANE_WIDTH
      }
    }
    if (isBottom) {
      tempXYCurrent.y = tempXYCurrent.y + speed
      if (tempXYCurrent.y > C_HEIGHT - PLANE_HEIGHT) {
        tempXYCurrent.y = C_HEIGHT - PLANE_HEIGHT
      }
    }

    ctx.drawImage(plane, tempXYCurrent.x, tempXYCurrent.y, tempXYCurrent.width, tempXYCurrent.height)
  }

  const drawBullet = (ctx: CanvasRenderingContext2D) => {

    const { x: planeX , y: planeY } = getXY()

    bulletArr.forEach(item => {
      item.y = item.y + BULLET_SPEED
    })

    bulletArr = bulletArr.filter(item => {
      return item.y > -BULLET_HEIGHT || (!item?.isOver)
    })

    if (bulletGapNum % BULLET_GAP === 0) {
      bulletArr.push({ x: planeX + PLANE_WIDTH / 2 - BULLET_WIDTH / 2,y: planeY - BULLET_HEIGHT, width: BULLET_WIDTH, height: BULLET_HEIGHT, isOver: false, ifDel: false, boomIndex: 0, hp: 0 })
    }

    bulletArr.forEach((item) => {
      ctx.drawImage(bullet, item.x, item.y, BULLET_WIDTH, BULLET_HEIGHT)
    })

    bulletGapNum++
  }

  const renderCanvas = () => {
    const ctx = getCtx()

    if (ctx) {

      // ctx.fillStyle = '#ff0000'
      clearCanvas(ctx)
      // 绘制背景
      ctx.drawImage(background, 0, 0, C_WIDTH, C_HEIGHT)
      // 绘制敌机
      drawEnemy(ctx)
      // 绘制主角飞机
      drawMajorPlane(ctx)
      // 绘制子弹
      drawBullet(ctx)
      
      // ctx.fillRect(x, y, 150, 75)
    }
    
  }

  // 判断是否加载完图像
  const ifLoadSource = () => {
    const arr = [plane, background, enemy1, bullet, boom]

    return Promise.all(arr.map(item => {
      return new Promise<void>((resolve, reject) => {
        if (item?.complete) {
          resolve()
        } else {
          item.onload = () => {
            resolve()
          }
        }
      })
    })).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }

  useEffect(() => {

    const init = async () => {

      // 初始主角飞机位置
      const current = xyObj.current
      current.x = C_WIDTH / 2 - PLANE_WIDTH / 2
      current.y = C_HEIGHT - PLANE_HEIGHT
    }

    const render = () => {
      requestAnimationFrame(async () => {
        const isLoad = await ifLoadSource()
        if (isLoad) {
          renderCanvas()
        }
        render()
      })
    }
    
    init()
    render()
  }, [renderCanvas, ifLoadSource])


  useEffect(() => {
    const handleKeyDown = async (e: any) => {
      switch (e?.key) {
        case 'ArrowLeft':
          directionFlagRef.current.isLeft = true
          
          break
        case 'ArrowUp':
          directionFlagRef.current.isTop = true
          
          break
        case 'ArrowRight':
          directionFlagRef.current.isRight = true
          
          break
        case 'ArrowDown':
          directionFlagRef.current.isBottom = true
          
          break
      }   
    }

    const handleKeyUp = (e: any) => {
      switch (e?.key) {
        case 'ArrowLeft':
          directionFlagRef.current.isLeft = false
          break
        case 'ArrowUp':
          directionFlagRef.current.isTop = false
          break
        case 'ArrowRight':
          directionFlagRef.current.isRight = false
          break
        case 'ArrowDown':
          directionFlagRef.current.isBottom = false
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <canvas ref={canvasRef} width={C_WIDTH} height={C_HEIGHT}>您的浏览器不支持canvas</canvas>
  )
}

export default App
